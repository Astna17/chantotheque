// src/screens/AccueilScreen.tsx
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Accueil'>;

export default function AccueilScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>🎵 Notre Chantothèque</Text>
      <Text style={styles.sousTitre}>Recherche et chants arriveront bientôt</Text>

      <TouchableOpacity
        style={styles.bouton}
        onPress={() => navigation.navigate('Categories')}
      >
        <Text style={styles.texteBouton}>Gérer les catégories</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.bouton}
        onPress={() => navigation.navigate('AjoutChant')}
      >
        <Text style={styles.texteBouton}>Ajouter un chant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titre: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  sousTitre: { fontSize: 14, color: '#666', marginBottom: 30 },
  bouton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  texteBouton: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});