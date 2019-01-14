use std::collections::HashMap;
use rand::{self, rngs::ThreadRng, Rng};
use serde_json::json;
use actix::prelude::*;
use crate::utils::{get_game_config};
use crate::storage::GameObject;

#[derive(Message)]
pub struct Message(pub String);

/// New chat session is created
#[derive(Message)]
#[rtype(usize)]
pub struct Connect {
    pub addr: Recipient<Message>,
}

/// Session is disconnected
#[derive(Message)]
pub struct Disconnect {
    pub id: usize,
}

/// Join to location
#[derive(Message)]
pub struct JoinLocation {
    // user id
    pub id: usize,

    // location name
    pub name: String,
}

/// Send message to specific room
#[derive(Message)]
pub struct ClientMessage {
    pub id: usize,
    pub message: String,
    pub location: String,
}

pub struct Server {
    sessions: HashMap<usize, Recipient<Message>>,
    locations: HashMap<String, HashMap<usize, GameObject>>,
    rng: ThreadRng,
}


impl Default for Server {
    fn default() -> Server {
        // default locations
        let locations = get_game_config().locations;

        Server {
            sessions: HashMap::new(),
            locations,
            rng: rand::thread_rng(),
        }
    }
}

impl Server {
    fn send_message_except(&self, location: &str, message: String, except_id: usize) {
        if let Some(sessions) = self.locations.get(location) {
            for id in sessions.keys() {
                if *id != except_id {
                    if let Some(addr) = self.sessions.get(id) {
                        let _ = addr.do_send(Message(message.to_owned()));
                    }
                }
            }
        }
    }

    fn send_message_to(&self, location: &str, message: String, player_id: usize) {
        if let Some(sessions) = self.locations.get(location) {
            println!("send_message_to {}", player_id);
            for id in sessions.keys() {
                if *id == player_id {
                    if let Some(addr) = self.sessions.get(id) {
                        let _ = addr.do_send(Message(message.to_owned()));
                    }
                }
            }
        }
    }
}

impl Actor for Server {
    type Context = Context<Self>;
}


/// Handler for Message message.
impl Handler<ClientMessage> for Server {
    type Result = ();

    fn handle(&mut self, msg: ClientMessage, _: &mut Context<Self>) {
        self.send_message_except(&msg.location, msg.message, msg.id);
    }
}

impl Handler<Connect> for Server {
    type Result = usize;

    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
        let id = self.rng.gen::<usize>();
        self.sessions.insert(id, msg.addr);

        id
    }
}

impl Handler<JoinLocation> for Server {
    type Result = ();

    fn handle(&mut self, msg: JoinLocation, _: &mut Context<Self>) {
        let JoinLocation { id, name } = msg;
        let mut locs = Vec::new();

        // remove session id from locations
        for (name, location) in &mut self.locations {
            if !location.remove(&id).is_some() {
                locs.push(name.to_owned());
            } else {
                // user changed location
                // TODO: notify other users
            }
        }

        let user = GameObject::new(Some("random_name".to_string()));
        let mut res_data = json!([
            "message",
            {
                "type": "joined_location",
                "location": &name,
                "player_id": &id,
                "name": &user.name,
                "lives": &user.lives,
                "speed": &user.speed,
                "x": &user.x,
                "y": &user.y,
                "z": &user.z,
            }
        ]);

        self.locations.get_mut(&name).unwrap().insert(id, user);

        self.send_message_except(&name, res_data.to_string(), id);

        res_data[0] = json!("response");
        // res_data[1]["type"] = json!("response");

        self.send_message_to(&name, res_data.to_string(), id);
    }
}


/// Handler for Disconnect message.
impl Handler<Disconnect> for Server {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Context<Self>) {
        let Disconnect { id } = msg;
        let mut locs = Vec::new();

        if self.sessions.remove(&id).is_some() {
            for (name, location) in &mut self.locations {
                if location.remove(&id).is_some() {
                    locs.push(name.to_owned());
                }
            }
        }

        for loc in locs {
            let res_data = json!([
                "message",
                {
                    "type": "disconnect",
                    "location": &loc,
                    "player_id": &id,
                }
            ]);

            self.send_message_except(&loc, res_data.to_string(), 0);
        }
    }
}