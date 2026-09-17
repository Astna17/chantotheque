import { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { getChantDetail, supprimerChant } from '../database/chants';
import { supprimerFichier } from '../database/fichier';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ChantDetail } from '../types';
import LecteurAudio from '../components/LecteurAudio';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type DetailChantRouteProp = RouteProp<RootStackParamList, 'DetailChant'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DetailChant'>;

export default function DetailChantScreen() {
  const route = useRoute<DetailChantRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { chantId } = route.params;

  const [chant, setChant] = useState<ChantDetail | null>(null);

  useFocusEffect(
    useCallback(() => {
      const resultat = getChantDetail(chantId);
      setChant(resultat);
    }, [chantId])
  );

  function confirmerSuppression() {
    if (!chant) return;
    Alert.alert(
      'Supprimer',
      `Supprimer le chant "${chant.titre}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await supprimerFichier(chant.audioUri);
            await supprimerFichier(chant.imageUri);
            supprimerChant(chant.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  if (!chant) {
    return (
      <View style={styles.centre}>
        <Text>Chant introuvable.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {chant.imageUri && (
        <Image source={{ uri: chant.imageUri }} style={styles.image} />
      )}

      <Text style={styles.titre}>🎵 {chant.titre}</Text>
      {chant.auteur && <Text style={styles.auteur}>{chant.auteur}</Text>}

      <View style={styles.actionsLigne}>
        <TouchableOpacity
          style={styles.boutonAction}
          onPress={() => navigation.navigate('AjoutChant', { chantId: chant.id })}
        >
          <Text style={styles.texteBoutonAction}>✏️ Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.boutonAction, styles.boutonSupprimer]}
          onPress={confirmerSuppression}
        >
          <Text style={[styles.texteBoutonAction, styles.texteSupprimer]}>🗑️ Supprimer</Text>
        </TouchableOpacity>
      </View>

      <LecteurAudio uriAudio={chant.audioUri} titre={chant.titre} />

      {chant.paroles && (
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>📝 PAROLES</Text>
          <Text style={styles.sectionTexte}>{chant.paroles}</Text>
        </View>
      )}

      {chant.solfege && (
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>🎼 SOLFÈGE</Text>
          <Text style={styles.sectionTexte}>{chant.solfege}</Text>
        </View>
      )}

      {chant.versets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>📖 VERSETS BIBLIQUES</Text>
          {chant.versets.map((verset) => (
            <View key={verset.id} style={styles.verset}>
              <Text style={styles.versetReference}>{verset.reference}</Text>
              <Text style={styles.versetTexte}>{verset.texte}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
  titre: { fontSize: 22, fontWeight: 'bold' },
  auteur: { fontSize: 15, color: '#666', marginBottom: 12 },
  actionsLigne: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  boutonAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  boutonSupprimer: { borderColor: '#dc2626' },
  texteBoutonAction: { color: '#2563eb', fontWeight: '600' },
  texteSupprimer: { color: '#dc2626' },
  section: { marginBottom: 20 },
  sectionTitre: { fontSize: 14, fontWeight: 'bold', color: '#2563eb', marginBottom: 8 },
  sectionTexte: { fontSize: 15, lineHeight: 22 },
  verset: { marginBottom: 10 },
  versetReference: { fontWeight: '600', fontSize: 14 },
  versetTexte: { fontSize: 14, fontStyle: 'italic', color: '#444' },
});