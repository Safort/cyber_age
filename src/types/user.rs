use std::time::{Instant};

pub struct UserSession {
    pub id: usize,
    pub hb: Instant,
    pub name: Option<String>,
    pub location: Option<String>,
}
