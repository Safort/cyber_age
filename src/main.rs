#[macro_use]
extern crate serde_derive;

use actix::{Arbiter};
use actix_web::{
    server::HttpServer,
    App,
    fs,
    middleware,
};

mod utils;
mod types;
mod storage;
mod ws_router;
mod ws_routes;

use self::types::state;
use self::utils::{get_public_path, get_game_config};

fn main() {
    let sys = actix::System::new("websocket-example");
    let arbiter = Arbiter::start(|_| ws_routes::Server::default());
    let public_path = get_public_path();

    HttpServer::new(move || {
        let app_state = state::AppState {
            config: get_game_config(),
            addr: arbiter.clone(),
        };

        App::with_state(app_state)
            .middleware(middleware::Logger::default())
            .resource("/ws", |r| r.route().f(ws_router::handle))
            .handler(
                "/",
                fs::StaticFiles::new(public_path).unwrap().index_file("index.html")
            )
    })
    .bind("127.0.0.1:8080")
    .unwrap()
    .start();

    println!("Started http server: http://127.0.0.1:8080");
    let _ = sys.run();
}
