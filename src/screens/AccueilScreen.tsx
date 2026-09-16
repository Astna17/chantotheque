// src/screens/AccueilScreen.tsx
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getChants } from '../database/chants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Chant } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Accueil'>;

export default function AccueilScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [chants, setChants] = useState<Chant[]>([]);

  useFocusEffect(
    useCallback(() => {
      setChants(getChants());
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>🎵 Notre Chantothèque</Text>

      <View style={styles.boutonsLigne}>
        <TouchableOpacity
          style={styles.bouton}
          onPress={() => navigation.navigate('Categories')}
        >
          <Text style={styles.texteBouton}>📁 Catégories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bouton}
          onPress={() => navigation.navigate('AjoutChant')}
        >
          <Text style={styles.texteBouton}>➕ Ajouter un chant</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sousTitreListe}>🎵 Chants récents</Text>

      <FlatList
        data={chants}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.vide}>Aucun chant pour l'instant.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.ligneChant}
            onPress={() => navigation.navigate('DetailChant', { chantId: item.id })}
          >
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.miniature} />
            ) : (
              <View style={styles.miniaturePlaceholder}>
                <Text>🎵</Text>
              </View>
            )}
            <View style={styles.infosChant}>
              <Text style={styles.titreChant}>{item.titre}</Text>
              {item.auteur && <Text style={styles.auteurChant}>{item.auteur}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  titre: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  boutonsLigne: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  bouton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  texteBouton: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  sousTitreListe: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  ligneChant: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  miniature: { width: 48, height: 48, borderRadius: 6, marginRight: 12 },
  miniaturePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infosChant: { flex: 1 },
  titreChant: { fontSize: 15, fontWeight: '600' },
  auteurChant: { fontSize: 13, color: '#666' },
  vide: { textAlign: 'center', color: '#999', marginTop: 20 },
});