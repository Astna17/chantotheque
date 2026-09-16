import { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { getChantDetail } from '../database/chants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ChantDetail } from '../types';

type DetailChantRouteProp = RouteProp<RootStackParamList, 'DetailChant'>;

export default function DetailChantScreen() {
  const route = useRoute<DetailChantRouteProp>();
  const { chantId } = route.params;

  const [chant, setChant] = useState<ChantDetail | null>(null);

  useFocusEffect(
    useCallback(() => {
      const resultat = getChantDetail(chantId);
      setChant(resultat);
    }, [chantId])
  );

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

      {/* Le lecteur audio viendra ici à l'étape suivante */}
      <View style={styles.placeholderLecteur}>
        <Text style={styles.placeholderTexte}>▶ Lecteur audio (bientôt)</Text>
      </View>

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
  auteur: { fontSize: 15, color: '#666', marginBottom: 16 },
  placeholderLecteur: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderTexte: { color: '#999' },
  section: { marginBottom: 20 },
  sectionTitre: { fontSize: 14, fontWeight: 'bold', color: '#2563eb', marginBottom: 8 },
  sectionTexte: { fontSize: 15, lineHeight: 22 },
  verset: { marginBottom: 10 },
  versetReference: { fontWeight: '600', fontSize: 14 },
  versetTexte: { fontSize: 14, fontStyle: 'italic', color: '#444' },
});