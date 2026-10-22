
import { Directory, File, Paths } from 'expo-file-system';

const dossiers = {
  audio: new Directory(Paths.document, 'audio'),
  image: new Directory(Paths.document, 'images'),
  partition: new Directory(Paths.document, 'partitions'),
};

function nomSecurise(nom: string): string {
  return nom.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function copierFichierLocal(
  uriSource: string,
  nomOriginal: string,
  type: 'audio' | 'image' | 'partition',
): Promise<string> {
  console.log(`[Import ${type}] URI source :`, uriSource);

  const source = new File(uriSource);

  if (!source.exists) {
    throw new Error(
      `Le fichier source est inaccessible (${type}). URI : ${uriSource}`,
    );
  }

  const dossier = dossiers[type];

  dossier.create({
    idempotent: true,
    intermediates: true,
  });

  const extension = nomOriginal.includes('.')
    ? `.${nomOriginal.split('.').pop()!.toLowerCase()}`
    : '';

  const base = nomOriginal.includes('.')
    ? nomOriginal.slice(0, nomOriginal.lastIndexOf('.'))
    : nomOriginal;

  const nomFinal = `${Date.now()}_${nomSecurise(base)}${extension}`;
  const destination = new File(dossier, nomFinal);

  await source.copy(destination);

  if (!destination.exists) {
    throw new Error(`La copie du fichier ${type} n'a pas abouti.`);
  }

  console.log(`[Import ${type}] Copie réussie :`, destination.uri);

  return destination.uri;
}
