import { db } from './init';
import { Chant, ChantDetail, Verset } from '../types';

export interface NouveauChant {
  titre: string;
  auteur: string | null;
  categorieId: number | null;
  audioUri: string;
  imageUri: string | null;
  paroles: string | null;
  solfege: string | null;
}

export function creerChant(chant: NouveauChant): number {
  const result = db.runSync(
    `INSERT INTO chants (titre, auteur, categorie_id, audio_uri, image_uri, paroles, solfege)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      chant.titre,
      chant.auteur,
      chant.categorieId,
      chant.audioUri,
      chant.imageUri,
      chant.paroles,
      chant.solfege,
    ]
  );
  return result.lastInsertRowId;
}

export function getChants(): Chant[] {
  return db.getAllSync<Chant>('SELECT * FROM chants ORDER BY date_ajout DESC;');
}

export function getChantsParCategorie(categorieId: number): Chant[] {
  return db.getAllSync<Chant>(
    'SELECT * FROM chants WHERE categorie_id = ? ORDER BY titre ASC;',
    [categorieId]
  );
}

export function rechercherChants(texte: string): Chant[] {
  const motif = `%${texte}%`;
  return db.getAllSync<Chant>(
    `SELECT * FROM chants WHERE titre LIKE ? OR auteur LIKE ? ORDER BY titre ASC;`,
    [motif, motif]
  );
}

export function getChantDetail(id: number): ChantDetail | null {
  const chant = db.getFirstSync<Chant>('SELECT * FROM chants WHERE id = ?;', [id]);
  if (!chant) return null;

  const categorie = chant.categorieId
    ? db.getFirstSync<{ id: number; nom: string }>(
        'SELECT * FROM categories WHERE id = ?;',
        [chant.categorieId]
      )
    : null;

  const versets = db.getAllSync<Verset>(
    `SELECT versets.* FROM versets
     INNER JOIN chant_versets ON versets.id = chant_versets.verset_id
     WHERE chant_versets.chant_id = ?;`,
    [id]
  );

  return { ...chant, categorie: categorie ?? null, versets };
}

export function modifierChant(id: number, chant: NouveauChant): void {
  db.runSync(
    `UPDATE chants
     SET titre = ?, auteur = ?, categorie_id = ?, audio_uri = ?, image_uri = ?, paroles = ?, solfege = ?
     WHERE id = ?;`,
    [
      chant.titre,
      chant.auteur,
      chant.categorieId,
      chant.audioUri,
      chant.imageUri,
      chant.paroles,
      chant.solfege,
      id,
    ]
  );
}

export function supprimerChant(id: number): void {
  db.runSync('DELETE FROM chants WHERE id = ?;', [id]);
}

export function lierVerset(chantId: number, versetId: number): void {
  db.runSync(
    'INSERT OR IGNORE INTO chant_versets (chant_id, verset_id) VALUES (?, ?);',
    [chantId, versetId]
  );
}

// Délier un verset d'un chant
export function delierVerset(chantId: number, versetId: number): void {
  db.runSync(
    'DELETE FROM chant_versets WHERE chant_id = ? AND verset_id = ?;',
    [chantId, versetId]
  );
}