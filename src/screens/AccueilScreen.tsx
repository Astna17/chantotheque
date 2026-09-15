import { StyleSheet, Text, View } from 'react-native';

export default function AccueilScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titre}>🎵 Notre Chantothèque</Text>
      <Text style={styles.sousTitre}>Recherche et catégories arriveront bientôt</Text>
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
  titre: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sousTitre: {
    fontSize: 14,
    color: '#666',
  },
});