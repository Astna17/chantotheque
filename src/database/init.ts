import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('chantotheque.db');

export function initDatabase() {
  db.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS chants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      auteur TEXT,
      categorie_id INTEGER,
      audio_uri TEXT NOT NULL,
      image_uri TEXT,
      paroles TEXT,
      solfege TEXT,
      date_ajout TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (categorie_id) REFERENCES categories (id)
    );

    CREATE TABLE IF NOT EXISTS versets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL UNIQUE,
      texte TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chant_versets (
      chant_id INTEGER NOT NULL,
      verset_id INTEGER NOT NULL,
      PRIMARY KEY (chant_id, verset_id),
      FOREIGN KEY (chant_id) REFERENCES chants (id) ON DELETE CASCADE,
      FOREIGN KEY (verset_id) REFERENCES versets (id) ON DELETE CASCADE
    );
  `);

  console.log('Base de données initialisée');
}