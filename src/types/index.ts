export interface Categorie {
  id: number;
  nom: string;
}

export interface Verset {
  id: number;
  reference: string;
  texte: string;
}

export interface Chant {
  id: number;
  titre: string;
  auteur: string | null;
  categorieId: number | null;
  audioUri: string;
  imageUri: string | null;
  paroles: string | null;
  solfege: string | null;
  dateAjout: string;
}

export interface ChantDetail extends Chant {
  categorie: Categorie | null;
  versets: Verset[];
}