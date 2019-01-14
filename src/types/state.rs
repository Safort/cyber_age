use actix::{Addr};
use crate::types::Config;
use crate::ws_routes::{Server};

pub struct AppState {
    pub config: Config,
    pub addr: Addr<Server>,
}
