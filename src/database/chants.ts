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

export type VersetSaisie = {
  reference: string;
  texte: string;
};

export async function obtenirChants(): Promise<Chant[]> {
  const db = await getDatabase();

  return db.getAllAsync<Chant>(`
    SELECT *
    FROM chants
    ORDER BY titre COLLATE NOCASE ASC;
  `);
}

export async function ajouterChantComplet(
  chant: {
    titre: string;
    auteur: string;
    audio_uri: string;
    image_uri: string | null;
    paroles: string;
    partition_uri: string | null;
  },
  versets: VersetSaisie[],
): Promise<number> {
  const db = await getDatabase();
  let nouvelId = 0;

  await db.withTransactionAsync(async () => {
    const resultat = await db.runAsync(
      `INSERT INTO chants (
        titre,
        auteur,
        audio_uri,
        image_uri,
        paroles,
        partition_uri
      ) VALUES (?, ?, ?, ?, ?, ?);`,
      chant.titre.trim(),
      chant.auteur.trim() || null,
      chant.audio_uri,
      chant.image_uri,
      chant.paroles.trim() || null,
      chant.partition_uri,
    );

    nouvelId = resultat.lastInsertRowId;

    for (const verset of versets) {
      if (!verset.reference.trim() || !verset.texte.trim()) {
        continue;
      }

      await db.runAsync(
        `INSERT INTO versets (
          chant_id,
          reference_biblique,
          texte
        ) VALUES (?, ?, ?);`,
        nouvelId,
        verset.reference.trim(),
        verset.texte.trim(),
      );
    }
  });

  return nouvelId;
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

export type Verset = {
  id: number;
  chant_id: number;
  reference_biblique: string;
  texte: string;
};

export type ChantDetail = Chant & {
  versets: Verset[];
};

export async function obtenirChantParId(
  id: number,
): Promise<ChantDetail | null> {
  const db = await getDatabase();

  const chant = await db.getFirstAsync<Chant>(
    `SELECT * FROM chants WHERE id = ?;`,
    id,
  );

  if (!chant) {
    return null;
  }

  const versets = await db.getAllAsync<Verset>(
    `SELECT id, chant_id, reference_biblique, texte
     FROM versets
     WHERE chant_id = ?
     ORDER BY id ASC;`,
    id,
  );

  return {
    ...chant,
    versets,
  };
}