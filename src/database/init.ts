
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'chantotheque.db';

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }

  database = await SQLite.openDatabaseAsync(DB_NAME);

  return database;
}

export async function initDatabase(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      auteur TEXT,
      audio_uri TEXT NOT NULL,
      image_uri TEXT,
      paroles TEXT,
      partition_uri TEXT,
      est_favori INTEGER NOT NULL DEFAULT 0
        CHECK (est_favori IN (0, 1)),
      date_creation TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      date_modification TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS versets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chant_id INTEGER NOT NULL,
      reference_biblique TEXT NOT NULL,
      texte TEXT NOT NULL,
      FOREIGN KEY (chant_id)
        REFERENCES chants(id)
        ON DELETE CASCADE
    );

    INSERT INTO schema_version (version)
    SELECT 1
    WHERE NOT EXISTS (
      SELECT 1 FROM schema_version
    );
  `);

  
  // Vérifier les colonnes réellement présentes dans versets.
  const colonnes = await db.getAllAsync<{ name: string }>(
    'PRAGMA table_info(versets);'
  );

  const nomsColonnes = colonnes.map((colonne) => colonne.name);

  // Ajouter les colonnes manquantes.
  if (!nomsColonnes.includes('chant_id')) {
    await db.execAsync(`
      ALTER TABLE versets
      ADD COLUMN chant_id INTEGER;
    `);
  }

  if (!nomsColonnes.includes('reference_biblique')) {
    await db.execAsync(`
      ALTER TABLE versets
      ADD COLUMN reference_biblique TEXT;
    `);
  }

  if (!nomsColonnes.includes('texte')) {
    await db.execAsync(`
      ALTER TABLE versets
      ADD COLUMN texte TEXT;
    `);
  }

}