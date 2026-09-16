import { db } from './init';
import { Verset } from '../types';

export function getOuCreerVerset(reference: string, texte: string): number {
  const existant = db.getFirstSync<Verset>(
    'SELECT * FROM versets WHERE reference = ?;',
    [reference]
  );
  if (existant) return existant.id;

  const result = db.runSync(
    'INSERT INTO versets (reference, texte) VALUES (?, ?);',
    [reference, texte]
  );
  return result.lastInsertRowId;
}

export function getVersets(): Verset[] {
  return db.getAllSync<Verset>('SELECT * FROM versets ORDER BY reference ASC;');
}