use tauri_plugin_sql::{Builder as SqlBuilder, Migration, MigrationKind};

/// Schema v1 + seed das atividades padrão, no mesmo commit da mudança de schema
/// (regra 7 do CLAUDE.md). Precisa bater com o contrato do adaptador web:
/// mesmos ids/nomes/cores em `packages/adapters/web/src/migrations.ts`.
///
/// Várias instruções SQL num único `Migration.sql` é o padrão do migrator do
/// sqlx (reaproveitado pelo tauri-plugin-sql) — cada migration roda como um
/// script, não uma instrução isolada.
const MIGRATION_V1_SQL: &str = r#"
CREATE TABLE atividades (
  id TEXT PRIMARY KEY, nome TEXT NOT NULL, cor TEXT NOT NULL, ativa INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE sessoes (
  id TEXT PRIMARY KEY, atividade_id TEXT NOT NULL, preset_id TEXT NOT NULL,
  inicio INTEGER NOT NULL, fim INTEGER NOT NULL, duracao_seg INTEGER NOT NULL, status TEXT NOT NULL
);
CREATE TABLE presets (
  id TEXT PRIMARY KEY, nome TEXT NOT NULL, minutos INTEGER NOT NULL
);
CREATE INDEX idx_sessoes_inicio ON sessoes(inicio);

INSERT INTO atividades (id, nome, cor, ativa) VALUES
  ('estudo', 'Estudo', '#8B5CF6', 1),
  ('trabalho', 'Trabalho', '#22C55E', 0),
  ('leitura', 'Leitura', '#FB923C', 0),
  ('projeto-pessoal', 'Projeto pessoal', '#38BDF8', 0);
"#;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "schema_inicial_e_seed_atividades",
        sql: MIGRATION_V1_SQL,
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(
            SqlBuilder::default()
                .add_migrations("sqlite:app.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .run(tauri::generate_context!())
        .expect("erro ao rodar o app FocusFlow");
}
