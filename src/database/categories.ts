import { db } from './init';
import { Categorie } from '../types';

//Créer une nouvelle catégorie
export function creerCategorie(nom: string): number {
  const result = db.runSync(
    'INSERT INTO categories (nom) VALUES (?);',
    [nom]
  );
  return result.lastInsertRowId;
}

//Récupérer toutes les catégories
export function getCategories(): Categorie[] {
  const result = db.getAllSync<Categorie>(
    'SELECT * FROM categories ORDER BY nom ASC;'
  );
  return result;
}

//Récupérer une seule catégorie par son id
export function getCategorieParId(id: number): Categorie | null {
  const result = db.getFirstSync<Categorie>(
    'SELECT * FROM categories WHERE id = ?;',
    [id]
  );
  return result ?? null;
}

//Modifier le nom d'une catégorie
export function modifierCategorie(id: number, nouveauNom: string): void {
  db.runSync(
    'UPDATE categories SET nom = ? WHERE id = ?;',
    [nouveauNom, id]
  );
}

//Supprimer une catégorie
export function supprimerCategorie(id: number): void {
  db.runSync(
    'DELETE FROM categories WHERE id = ?;',
    [id]
  );
}