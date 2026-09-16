//import * as FileSystem from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';

const DOSSIER_AUDIO = `${FileSystem.documentDirectory}audio/`;
const DOSSIER_IMAGES = `${FileSystem.documentDirectory}images/`;

export async function initDossiersFichiers(): Promise<void> {
  const infoAudio = await FileSystem.getInfoAsync(DOSSIER_AUDIO);
  if (!infoAudio.exists) {
    await FileSystem.makeDirectoryAsync(DOSSIER_AUDIO, { intermediates: true });
  }

  const infoImages = await FileSystem.getInfoAsync(DOSSIER_IMAGES);
  if (!infoImages.exists) {
    await FileSystem.makeDirectoryAsync(DOSSIER_IMAGES, { intermediates: true });
  }
}

export async function copierFichierAudio(
    uriOrigine: string, 
    nomOriginal: string
): Promise<string> {
  const extension = nomOriginal.split('.').pop() ?? 'mp3';
  const nomUnique = `${Date.now()}.${extension}`;
  const destination = `${DOSSIER_AUDIO}${nomUnique}`;

  await FileSystem.copyAsync({ from: uriOrigine, to: destination });
  return destination;
}

export async function copierImage(
    uriOrigine: string
): Promise<string> {
  const nomUnique = `${Date.now()}.jpg`;
  const destination = `${DOSSIER_IMAGES}${nomUnique}`;

  await FileSystem.copyAsync({ from: uriOrigine, to: destination });
  return destination;
}

// Supprime un fichier 
export async function supprimerFichier(
    uri: string | null
): Promise<void> {
  if (!uri) return;
  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}