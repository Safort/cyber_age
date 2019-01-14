use std::time::{Instant, Duration};
use rand;
use serde_json::json;
use actix::prelude::*;
use actix::{
    Actor,
    StreamHandler,
    Running
};
use actix_web::{
    HttpRequest,
    HttpResponse,
    Error,
    ws,
};
use crate::types::{state::AppState, UserSession};
use crate::ws_routes;

/// How often heartbeat pings are sent
const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
/// How long before lack of client response causes a timeout
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

pub fn get_location_list(ctx: &mut ws::WebsocketContext<UserSession, AppState>) {
    let keys: Vec<_> = ctx.state().config.locations
        .keys()
        .map(|key| key.to_string())
        .collect();
    let res = json!([
        "response",
        {
            "type": "location_list",
            "location_list": &keys,
        }
    ]);

    ctx.text(res.to_string());
}


impl Actor for UserSession {
    type Context = ws::WebsocketContext<Self, AppState>;

    fn started(&mut self, ctx: &mut Self::Context) {
        self.hb(ctx);

        let addr = ctx.address();
        ctx.state()
            .addr
            .send(ws_routes::Connect {
                addr: addr.recipient(),
            })
            .into_actor(self)
            .then(|res, act, ctx| {
                match res {
                    Ok(res) => act.id = res,
                    // something is wrong with chat server
                    _ => ctx.stop(),
                }
                fut::ok(())
            })
            .wait(ctx);
    }

    fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
        ctx.state().addr.do_send(ws_routes::Disconnect { id: self.id });
        Running::Stop
    }
}

impl Handler<ws_routes::Message> for UserSession {
    type Result = ();

    fn handle(&mut self, msg: ws_routes::Message, ctx: &mut Self::Context) {
        ctx.text(msg.0);
    }
}

impl UserSession {
    fn hb(&self, ctx: &mut ws::WebsocketContext<Self, AppState>) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            // check client heartbeats
            if Instant::now().duration_since(act.hb) > CLIENT_TIMEOUT {
                // heartbeat timed out
                println!("Websocket Client heartbeat failed, disconnecting!");

                // notify chat server
                ctx.state()
                    .addr
                    .do_send(ws_routes::Disconnect { id: act.id });

                // stop actor
                ctx.stop();

                // don't try to send a ping
                return;
            }

            ctx.ping("");
        });
    }
}

impl StreamHandler<ws::Message, ws::ProtocolError> for UserSession {

    fn handle(&mut self, message: ws::Message, ctx: &mut Self::Context) {
        match message {
            ws::Message::Ping(msg) => {
                self.hb = Instant::now();
                ctx.pong(&msg);
            },
            ws::Message::Pong(_) => {
                self.hb = Instant::now();
            },
            ws::Message::Text(msg) => {
                let m = msg.trim();

                if m.starts_with('/') {
                    let commands: Vec<&str> = m.splitn(2, ' ').collect();

                    match commands[0] {
                        "/location_list" => {
                            get_location_list(ctx);
                        },
                        "/join_location" => {
                            ctx.state().addr.do_send(ws_routes::JoinLocation {
                                id: self.id,
                                name: commands[1].to_string(),
                            });
                        },
                        _ => {}
                    }
                } else {
                    ctx.text(format!("{:?}", m));
                }

            },
            ws::Message::Binary(_) => {
                println!("ws::Message::Binary !!!");
            },
            ws::Message::Close(_) => {
                println!("Close");
                ctx.stop();
            },
        }
    }
}

pub fn handle(req: &HttpRequest<AppState>) -> Result<HttpResponse, Error> {
    let id: usize = rand::random();

    ws::start(
        req,
        UserSession {
            id,
            hb: Instant::now(),
            name: None,
            location: None,
        }
    )
}
