import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { File as ExpoFile } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { ajouterChantComplet, type VersetSaisie } from '../database/chants';
import { copierFichierLocal } from '../services/fichiers';

type Props = {
  onRetour: () => void;
  onEnregistre: () => void;
};

const COULEURS = {
  fond: '#101A30',
  carte: '#263752',
  or: '#D6B66C',
  ivoire: '#F5F1E8',
  secondaire: '#C3CBDA',
};

export default function AjoutChantScreen({
  onRetour,
  onEnregistre,
}: Props) {
  const [titre, setTitre] = useState('');
  const [auteur, setAuteur] = useState('');
  const [paroles, setParoles] = useState('');
  const [audio, setAudio] = useState<{
    uri: string;
    nom: string;
  } | null>(null);
  const [image, setImage] = useState<{
    uri: string;
    nom: string;
  } | null>(null);
  const [partition, setPartition] = useState<{
    uri: string;
    nom: string;
  } | null>(null);
  const [versets, setVersets] = useState<VersetSaisie[]>([
    { reference: '', texte: '' },
  ]);
  const [enregistrement, setEnregistrement] = useState(false);

  async function choisirAudio() {
  try {
    const resultat = await ExpoFile.pickFileAsync({
      mimeTypes: ['audio/*'],
    });

    if (!resultat.canceled) {
      const fichier = resultat.result;

      setAudio({
        uri: fichier.uri,
        nom: fichier.name,
      });

      console.log('[Sélection audio] URI :', fichier.uri);
      console.log('[Sélection audio] Nom :', fichier.name);
    }
  } catch (error) {
    console.error('Erreur de sélection audio :', error);
    Alert.alert(
      'Erreur',
      'Impossible de sélectionner ce fichier audio.',
    );
  }
}

  async function choisirImage() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Autorisation requise',
          'Autorise l’accès aux images pour choisir une couverture.',
        );
        return;
      }

      const resultat = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
      });

      if (!resultat.canceled) {
        const fichier = resultat.assets[0];
        setImage({
          uri: fichier.uri,
          nom: fichier.fileName || `couverture_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de sélectionner la couverture.');
    }
  }

  async function choisirPartition() {
    try {
      const resultat = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!resultat.canceled) {
        const fichier = resultat.assets[0];
        setPartition({ uri: fichier.uri, nom: fichier.name });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de sélectionner la partition.');
    }
  }

  function modifierVerset(
    index: number,
    champ: keyof VersetSaisie,
    valeur: string,
  ) {
    setVersets((anciens) =>
      anciens.map((verset, i) =>
        i === index ? { ...verset, [champ]: valeur } : verset,
      ),
    );
  }

  async function enregistrer() {
    if (!titre.trim()) {
      Alert.alert('Titre obligatoire', 'Saisis le titre du chant.');
      return;
    }

    if (!audio) {
      Alert.alert('Audio obligatoire', 'Sélectionne un fichier audio.');
      return;
    }

    const versetsComplets = versets.filter(
      (v) => v.reference.trim() && v.texte.trim(),
    );

    setEnregistrement(true);

    try {
      const audioLocal = await copierFichierLocal(
        audio.uri,
        audio.nom,
        'audio',
      );

      const imageLocale = image
        ? await copierFichierLocal(image.uri, image.nom, 'image')
        : null;

      const partitionLocale = partition
        ? await copierFichierLocal(
            partition.uri,
            partition.nom,
            'partition',
          )
        : null;

      await ajouterChantComplet(
        {
          titre,
          auteur,
          audio_uri: audioLocal,
          image_uri: imageLocale,
          paroles,
          partition_uri: partitionLocale,
        },
        versetsComplets,
      );

      Alert.alert('Chant enregistré', 'Le chant a été ajouté à ta bibliothèque.', [
        { text: 'OK', onPress: onEnregistre },
      ]);
    } catch (error) {
      console.error('Erreur lors de l’enregistrement du chant :', error);
      Alert.alert(
        'Erreur',
        'Le chant n’a pas pu être enregistré. Vérifie les fichiers sélectionnés et réessaie.',
      );
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contenu}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={onRetour} style={styles.retour}>
          <Text style={styles.texteRetour}>‹  Retour à la bibliothèque</Text>
        </TouchableOpacity>

        <Text style={styles.surtitre}>NOUVELLE ENTRÉE</Text>
        <Text style={styles.titrePage}>Ajouter un chant</Text>
        <Text style={styles.description}>
          Rassemble l’audio, les paroles et les ressources bibliques.
        </Text>

        <Text style={styles.label}>Titre du chant *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex. : Nzambe Tsara"
          placeholderTextColor="#9AA7BC"
          value={titre}
          onChangeText={setTitre}
        />

        <Text style={styles.label}>Auteur ou interprète</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom de l’auteur"
          placeholderTextColor="#9AA7BC"
          value={auteur}
          onChangeText={setAuteur}
        />

        <Text style={styles.label}>Fichier audio *</Text>
        <TouchableOpacity style={styles.importer} onPress={choisirAudio}>
          <Text style={styles.icone}>♫</Text>
          <View style={styles.infoFichier}>
            <Text style={styles.texteImporter}>
              {audio ? 'Audio sélectionné' : 'Choisir un fichier audio'}
            </Text>
            <Text style={styles.nomFichier}>
              {audio?.nom || 'MP3, M4A, WAV…'}
            </Text>
          </View>
          <Text style={styles.action}>＋</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Image de couverture</Text>
        <TouchableOpacity style={styles.importer} onPress={choisirImage}>
          <Text style={styles.icone}>▧</Text>
          <View style={styles.infoFichier}>
            <Text style={styles.texteImporter}>
              {image ? 'Couverture sélectionnée' : 'Choisir une image'}
            </Text>
            <Text style={styles.nomFichier}>
              {image?.nom || 'JPG, PNG… (facultatif)'}
            </Text>
          </View>
          <Text style={styles.action}>＋</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Paroles</Text>
        <TextInput
          style={[styles.input, styles.zoneTexte]}
          placeholder="Saisis les paroles du chant…"
          placeholderTextColor="#9AA7BC"
          value={paroles}
          onChangeText={setParoles}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>Partition</Text>
        <TouchableOpacity style={styles.importer} onPress={choisirPartition}>
          <Text style={styles.icone}>▤</Text>
          <View style={styles.infoFichier}>
            <Text style={styles.texteImporter}>
              {partition ? 'Partition sélectionnée' : 'Importer une partition'}
            </Text>
            <Text style={styles.nomFichier}>
              {partition?.nom || 'PDF ou image (facultatif)'}
            </Text>
          </View>
          <Text style={styles.action}>＋</Text>
        </TouchableOpacity>

        <View style={styles.enteteVersets}>
          <View style={styles.infoVersets}>
            <Text style={styles.labelVersets}>Versets bibliques</Text>
            <Text style={styles.aide}>
              Ajoute une référence et le texte correspondant.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.ajouterVerset}
            onPress={() =>
              setVersets((anciens) => [
                ...anciens,
                { reference: '', texte: '' },
              ])
            }
          >
            <Text style={styles.action}>＋</Text>
          </TouchableOpacity>
        </View>

        {versets.map((verset, index) => (
          <View key={index} style={styles.carteVerset}>
            <Text style={styles.numeroVerset}>VERSET {index + 1}</Text>
            <TextInput
              style={styles.input}
              placeholder="Référence (ex. : Psaume 23:1)"
              placeholderTextColor="#9AA7BC"
              value={verset.reference}
              onChangeText={(valeur) =>
                modifierVerset(index, 'reference', valeur)
              }
            />
            <TextInput
              style={[styles.input, styles.zoneTexte]}
              placeholder="Texte du verset"
              placeholderTextColor="#9AA7BC"
              value={verset.texte}
              onChangeText={(valeur) =>
                modifierVerset(index, 'texte', valeur)
              }
              multiline
              textAlignVertical="top"
            />
            {versets.length > 1 && (
              <TouchableOpacity
                onPress={() =>
                  setVersets((anciens) =>
                    anciens.filter((_, i) => i !== index),
                  )
                }
              >
                <Text style={styles.supprimerVerset}>Supprimer ce verset</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.boutonEnregistrer,
            enregistrement && styles.boutonDesactive,
          ]}
          onPress={enregistrer}
          disabled={enregistrement}
        >
          {enregistrement ? (
            <ActivityIndicator color={COULEURS.fond} />
          ) : (
            <Text style={styles.texteBouton}>Enregistrer le chant</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>* Champs obligatoires</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COULEURS.fond },
  contenu: { padding: 22, paddingTop: 54, paddingBottom: 40 },
  retour: { marginBottom: 28 },
  texteRetour: { color: COULEURS.or, fontSize: 14, fontWeight: '600' },
  surtitre: { color: COULEURS.or, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  titrePage: { color: COULEURS.ivoire, fontSize: 29, fontWeight: '700', marginTop: 10 },
  description: { color: COULEURS.secondaire, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 24 },
  label: { color: COULEURS.ivoire, fontSize: 14, fontWeight: '600', marginBottom: 9, marginTop: 18 },
  input: { backgroundColor: COULEURS.carte, color: COULEURS.ivoire, borderRadius: 12, padding: 15, fontSize: 14 },
  zoneTexte: { minHeight: 110, marginTop: 8 },
  importer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COULEURS.carte, padding: 15, borderRadius: 14 },
  icone: { color: COULEURS.or, fontSize: 27, width: 42 },
  infoFichier: { flex: 1 },
  texteImporter: { color: COULEURS.ivoire, fontSize: 14, fontWeight: '600' },
  nomFichier: { color: COULEURS.secondaire, fontSize: 12, marginTop: 5 },
  action: { color: COULEURS.or, fontSize: 24, fontWeight: '600' },
  enteteVersets: { flexDirection: 'row', alignItems: 'center', marginTop: 26, marginBottom: 12 },
  infoVersets: { flex: 1 },
  labelVersets: { color: COULEURS.ivoire, fontSize: 18, fontWeight: '700' },
  aide: { color: COULEURS.secondaire, fontSize: 12, marginTop: 6 },
  ajouterVerset: { padding: 8 },
  carteVerset: { backgroundColor: '#1B2941', borderRadius: 14, padding: 14, marginBottom: 12 },
  numeroVerset: { color: COULEURS.or, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  supprimerVerset: { color: '#FF9B9B', textAlign: 'right', marginTop: 12, fontSize: 12 },
  boutonEnregistrer: { backgroundColor: COULEURS.or, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 28 },
  boutonDesactive: { opacity: 0.6 },
  texteBouton: { color: COULEURS.fond, fontSize: 15, fontWeight: '700' },
  note: { color: COULEURS.secondaire, fontSize: 12, marginTop: 14, textAlign: 'center' },
});
