
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.logo}>♪</Text>
      <Text style={styles.title}>Chantothèque</Text>
      <Text style={styles.subtitle}>
        Votre bibliothèque de chants et de louange
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101A30',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    color: '#D6B66C',
    fontSize: 76,
    marginBottom: 16,
  },
  title: {
    color: '#F5F1E8',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#C3CBDA',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 23,
  },
});
