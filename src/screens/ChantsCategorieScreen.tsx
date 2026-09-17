import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useFocusEffect, useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getChantsParCategorie } from '../database/chants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Chant } from '../types';

type ChantsCategorieRouteProp = RouteProp<RootStackParamList, 'ChantsCategorie'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChantsCategorie'>;

export default function ChantsCategorieScreen() {
  const route = useRoute<ChantsCategorieRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { categorieId } = route.params;

  const [chants, setChants] = useState<Chant[]>([]);

  useFocusEffect(
    useCallback(() => {
      setChants(getChantsParCategorie(categorieId));
    }, [categorieId])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chants}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.vide}>Aucun chant dans cette catégorie.</Text>
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
  vide: { textAlign: 'center', color: '#999', marginTop: 40 },
});