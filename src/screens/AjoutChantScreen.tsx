import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { getCategories } from '../database/categories';
import { creerChant, modifierChant, getChantDetail, lierVerset, delierVerset } from '../database/chants';
import { getOuCreerVerset } from '../database/versets';
import { copierFichierAudio, copierImage } from '../database/fichier';
import { Categorie } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

interface VersetTemporaire {
  id?: number; 
  reference: string;
  texte: string;
}

type AjoutChantRouteProp = RouteProp<RootStackParamList, 'AjoutChant'>;

export default function AjoutChantScreen() {
  const navigation = useNavigation();
  const route = useRoute<AjoutChantRouteProp>();
  const chantIdEnEdition = route.params?.chantId ?? null;
  const modeEdition = chantIdEnEdition !== null;

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [titre, setTitre] = useState('');
  const [auteur, setAuteur] = useState('');
  const [categorieId, setCategorieId] = useState<number | null>(null);
  const [paroles, setParoles] = useState('');
  const [solfege, setSolfege] = useState('');

  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioNom, setAudioNom] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [versets, setVersets] = useState<VersetTemporaire[]>([]);
  const [versetsSupprimesIds, setVersetsSupprimesIds] = useState<number[]>([]);
  const [referenceEnCours, setReferenceEnCours] = useState('');
  const [texteEnCours, setTexteEnCours] = useState('');

  const [enregistrement, setEnregistrement] = useState(false);
  const [chargementInitial, setChargementInitial] = useState(modeEdition);

  useFocusEffect(
    useCallback(() => {
      setCategories(getCategories());
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (modeEdition && chantIdEnEdition !== null) {
        const chant = getChantDetail(chantIdEnEdition);
        if (chant) {
          setTitre(chant.titre);
          setAuteur(chant.auteur ?? '');
          setCategorieId(chant.categorieId);
          setParoles(chant.paroles ?? '');
          setSolfege(chant.solfege ?? '');
          setAudioUri(chant.audioUri);
          setAudioNom('Fichier audio actuel');
          setImageUri(chant.imageUri);
          setVersets(chant.versets.map((v) => ({ id: v.id, reference: v.reference, texte: v.texte })));
        }
        setChargementInitial(false);
      }
    }, [modeEdition, chantIdEnEdition])
  );

  async function choisirAudio() {
    const resultat = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: false,
    });
    if (resultat.canceled) return;
    const fichier = resultat.assets[0];
    setAudioUri(fichier.uri);
    setAudioNom(fichier.name);
  }

  async function choisirImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', "L'accès aux images est nécessaire.");
      return;
    }
    const resultat = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (resultat.canceled) return;
    setImageUri(resultat.assets[0].uri);
  }

  function ajouterVerset() {
    const ref = referenceEnCours.trim();
    const texte = texteEnCours.trim();
    if (ref.length === 0 || texte.length === 0) {
      Alert.alert('Erreur', 'Référence et texte du verset sont requis.');
      return;
    }
    setVersets([...versets, { reference: ref, texte }]);
    setReferenceEnCours('');
    setTexteEnCours('');
  }

  function supprimerVersetTemporaire(index: number) {
    const verset = versets[index];
    if (verset.id) {
      setVersetsSupprimesIds([...versetsSupprimesIds, verset.id]);
    }
    setVersets(versets.filter((_, i) => i !== index));
  }

  async function enregistrer() {
    const titrePropre = titre.trim();

    if (titrePropre.length === 0) {
      Alert.alert('Erreur', 'Le titre est obligatoire.');
      return;
    }
    if (categorieId === null) {
      Alert.alert('Erreur', 'La catégorie est obligatoire.');
      return;
    }
    if (audioUri === null) {
      Alert.alert('Erreur', 'Le fichier audio est obligatoire.');
      return;
    }

    setEnregistrement(true);
    try {
      // Si l'audio/image a été changé (nouvelle sélection), on copie le nouveau fichier.
      // Si c'est l'ancien chemin déjà stocké (mode édition sans changement), on le garde tel quel.
      const audioDejaDansApp = !!audioUri && audioUri.includes('/audio/');
      const imageDejaDansApp = !!imageUri && imageUri.includes('/images/');

      const audioUriFinal = audioDejaDansApp
        ? audioUri
        : await copierFichierAudio(audioUri, audioNom ?? 'audio.mp3');

      const imageUriFinal = imageUri
        ? imageDejaDansApp
          ? imageUri
          : await copierImage(imageUri)
        : null;

      let chantId: number;

      if (modeEdition && chantIdEnEdition !== null) {
        modifierChant(chantIdEnEdition, {
          titre: titrePropre,
          auteur: auteur.trim() || null,
          categorieId,
          audioUri: audioUriFinal,
          imageUri: imageUriFinal,
          paroles: paroles.trim() || null,
          solfege: solfege.trim() || null,
        });
        chantId = chantIdEnEdition;

        // On délie les versets retirés par l'utilisateur
        for (const versetId of versetsSupprimesIds) {
          delierVerset(chantId, versetId);
        }
      } else {
        chantId = creerChant({
          titre: titrePropre,
          auteur: auteur.trim() || null,
          categorieId,
          audioUri: audioUriFinal,
          imageUri: imageUriFinal,
          paroles: paroles.trim() || null,
          solfege: solfege.trim() || null,
        });
      }

      // On (re)lie tous les versets actuellement dans la liste
      for (const v of versets) {
        const versetId = getOuCreerVerset(v.reference, v.texte);
        lierVerset(chantId, versetId);
      }

      Alert.alert('Succès', modeEdition ? 'Le chant a été modifié.' : 'Le chant a été ajouté.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', "Une erreur s'est produite lors de l'enregistrement.");
      console.error(e);
    } finally {
      setEnregistrement(false);
    }
  }

  if (chargementInitial) {
    return (
      <View style={styles.centre}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Titre *</Text>
      <TextInput style={styles.input} value={titre} onChangeText={setTitre} placeholder="Titre du chant" />

      <Text style={styles.label}>Auteur</Text>
      <TextInput style={styles.input} value={auteur} onChangeText={setAuteur} placeholder="Auteur / compositeur" />

      <Text style={styles.label}>Catégorie *</Text>
      <View style={styles.categoriesConteneur}>
        {categories.length === 0 && (
          <Text style={styles.attention}>Aucune catégorie — crée-en une d'abord.</Text>
        )}
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.puceCategorie, categorieId === cat.id && styles.puceCategorieActive]}
            onPress={() => setCategorieId(cat.id)}
          >
            <Text style={[styles.puceCategorieTexte, categorieId === cat.id && styles.puceCategorieTexteActive]}>
              {cat.nom}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Fichier audio *</Text>
      <TouchableOpacity style={styles.boutonFichier} onPress={choisirAudio}>
        <Text style={styles.texteBoutonFichier}>
          {audioNom ? `🎵 ${audioNom}` : '📂 Choisir un fichier audio'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Image de couverture</Text>
      <TouchableOpacity style={styles.boutonFichier} onPress={choisirImage}>
        <Text style={styles.texteBoutonFichier}>
          {imageUri ? 'Image sélectionnée ✓' : '🖼️ Choisir une image'}
        </Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.apercu} />}

      <Text style={styles.label}>Paroles</Text>
      <TextInput
        style={[styles.input, styles.zoneTexte]}
        value={paroles}
        onChangeText={setParoles}
        placeholder="Paroles du chant..."
        multiline
      />

      <Text style={styles.label}>Notes de solfège</Text>
      <TextInput
        style={[styles.input, styles.zoneTexte]}
        value={solfege}
        onChangeText={setSolfege}
        placeholder="Notes / accords..."
        multiline
      />

      <Text style={styles.label}>Versets bibliques</Text>

      {versets.map((v, index) => (
        <View key={index} style={styles.versetAjoute}>
          <View style={{ flex: 1 }}>
            <Text style={styles.versetAjouteRef}>{v.reference}</Text>
            <Text style={styles.versetAjouteTexte}>{v.texte}</Text>
          </View>
          <TouchableOpacity onPress={() => supprimerVersetTemporaire(index)}>
            <Text style={styles.supprimerVerset}>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TextInput
        style={styles.input}
        value={referenceEnCours}
        onChangeText={setReferenceEnCours}
        placeholder="Référence (ex: Jean 3:16)"
      />
      <TextInput
        style={[styles.input, styles.zoneTexte, { marginTop: 8 }]}
        value={texteEnCours}
        onChangeText={setTexteEnCours}
        placeholder="Texte du verset..."
        multiline
      />
      <TouchableOpacity style={styles.boutonAjouterVerset} onPress={ajouterVerset}>
        <Text style={styles.texteBoutonAjouterVerset}>+ Ajouter ce verset</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.boutonEnregistrer, enregistrement && styles.boutonDesactive]}
        onPress={enregistrer}
        disabled={enregistrement}
      >
        <Text style={styles.texteBoutonEnregistrer}>
          {enregistrement ? 'Enregistrement...' : modeEdition ? 'Enregistrer les modifications' : 'Enregistrer'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  zoneTexte: { minHeight: 80, textAlignVertical: 'top' },
  categoriesConteneur: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  puceCategorie: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  puceCategorieActive: { backgroundColor: '#2563eb' },
  puceCategorieTexte: { color: '#2563eb' },
  puceCategorieTexteActive: { color: '#fff' },
  attention: { color: '#999', fontStyle: 'italic' },
  boutonFichier: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  texteBoutonFichier: { fontSize: 15 },
  apercu: { width: 100, height: 100, borderRadius: 8, marginTop: 8 },
  versetAjoute: {
    flexDirection: 'row',
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  versetAjouteRef: { fontWeight: '600', fontSize: 13 },
  versetAjouteTexte: { fontSize: 13, color: '#444', fontStyle: 'italic' },
  supprimerVerset: { marginLeft: 8, fontSize: 16 },
  boutonAjouterVerset: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  texteBoutonAjouterVerset: { color: '#2563eb', fontWeight: '600' },
  boutonEnregistrer: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  boutonDesactive: { opacity: 0.6 },
  texteBoutonEnregistrer: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});