use std::fs::File;
use std::io::prelude::*;
use serde;

// use crate::types::storage::GameObject;
use crate::types::Config;


#[cfg(debug_assertions)]
pub fn get_base_path() -> &'static str {
    "./"
}

#[cfg(not(debug_assertions))]
pub fn get_base_path() -> &'static str {
    "../"
}

#[cfg(debug_assertions)]
pub fn get_public_path() -> &'static str {
    "./target/public/"
}

#[cfg(not(debug_assertions))]
pub fn get_public_path() -> &'static str {
    "../public/"
}

pub fn get_game_config() -> Config {
    let path = get_base_path().to_owned() + "game_config.json";
    let mut file = File::open(path).unwrap();
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();

    let config: Config = serde_json::from_str(&contents).unwrap();

    config
}
