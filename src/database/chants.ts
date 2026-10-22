
import { getDatabase } from './init';

export type Chant = {
  id: number;
  titre: string;
  auteur: string | null;
  audio_uri: string;
  image_uri: string | null;
  paroles: string | null;
  partition_uri: string | null;
  est_favori: number;
  date_creation: string;
  date_modification: string;
};

export async function obtenirChants(): Promise<Chant[]> {
  const db = await getDatabase();

  return db.getAllAsync<Chant>(`
    SELECT *
    FROM chants
    ORDER BY titre COLLATE NOCASE ASC;
  `);
}

export async function ajouterChant(
  titre: string,
  audioUri: string,
  auteur?: string,
  imageUri?: string,
  paroles?: string,
  partitionUri?: string,
): Promise<number> {
  const db = await getDatabase();

  const resultat = await db.runAsync(
    `INSERT INTO chants (
      titre,
      auteur,
      audio_uri,
      image_uri,
      paroles,
      partition_uri
    ) VALUES (?, ?, ?, ?, ?, ?);`,
    titre.trim(),
    auteur?.trim() || null,
    audioUri,
    imageUri ?? null,
    paroles ?? null,
    partitionUri ?? null,
  );

  return resultat.lastInsertRowId;
}

export async function changerFavori(
  id: number,
  estFavori: boolean,
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE chants
     SET est_favori = ?,
         date_modification = CURRENT_TIMESTAMP
     WHERE id = ?;`,
    estFavori ? 1 : 0,
    id,
  );
}

export async function supprimerChant(id: number): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    'DELETE FROM chants WHERE id = ?;',
    id,
  );
}
