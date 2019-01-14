use rand;
use rand::Rng;

#[derive(Serialize, Deserialize, Debug)]
pub struct GameObject {
    pub object_type: GameObjectType,
    pub name: Option<String>,
    pub lives: usize,
    pub speed: usize,
    pub x: i32,
    pub y: i32,
    pub z: i32,
}

impl GameObject {
    pub fn new(name: Option<String>) -> GameObject {
        let mut rng = rand::thread_rng();

        GameObject {
            object_type: GameObjectType::Human,
            name,
            lives: 100,
            speed: 100,
            x: rng.gen_range(-2, 2),
            y: 0,
            z: 0,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub enum GameObjectType {
    Human,
}
