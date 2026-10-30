// Não modifique este arquivo — a lógica mora em `lib.rs` (compartilhada com o
// entry point mobile). Ver `focusflow_desktop_lib` em `Cargo.toml` > `[lib]`.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    focusflow_desktop_lib::run();
}
