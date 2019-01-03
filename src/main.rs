extern crate actix;

use actix_web::{server, App, fs, middleware};

#[cfg(debug_assertions)]
fn get_public_path() -> &'static str {
    "./target/public/"
}

#[cfg(not(debug_assertions))]
fn get_public_path() -> &'static str {
    "../public/"
}


fn main() {
    server::new(|| {
        let public_path = get_public_path();

        App::new()
            .middleware(middleware::Logger::default())
            .handler(
                "/",
                fs::StaticFiles::new(public_path).unwrap().index_file("index.html")
            )
    })
    .bind("127.0.0.1:8080")
    .unwrap()
    .run();
}
