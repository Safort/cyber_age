use std::collections::HashMap;
use crate::storage::GameObject;


#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub locations: HashMap<String, HashMap<usize, GameObject>>,
}
