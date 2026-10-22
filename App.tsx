
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { initDatabase } from './src/database/init';
import BibliothequeScreen from './src/screens/BibliothequeScreen';
import AjoutChantScreen from './src/screens/AjoutChantScreen';

export default function App() {
  const [pret, setPret] = useState(false);
  const [erreur, setErreur] = useState(false);
  const [ecran, setEcran] = useState<'bibliotheque' | 'ajout'>('bibliotheque');
  const [versionBibliotheque, setVersionBibliotheque] = useState(0);

  useEffect(() => {
    initDatabase()
      .then(() => setPret(true))
      .catch((error) => {
        console.error('Erreur SQLite :', error);
        setErreur(true);
      });
  }, []);

  if (erreur) {
    return (
      <View style={styles.message}>
        <Text style={styles.erreur}>
          Impossible de préparer la bibliothèque. Consulte les logs.
        </Text>
      </View>
    );
  }

  if (!pret) {
    return (
      <View style={styles.message}>
        <ActivityIndicator color="#D6B66C" size="large" />
        <Text style={styles.texte}>Préparation de Chantothèque...</Text>
      </View>
    );
  }

  return (
    <View style={styles.application}>
      <StatusBar style="light" />
      {ecran === 'bibliotheque' ? (
        <BibliothequeScreen
          key={versionBibliotheque}
          onAjouter={() => setEcran('ajout')}
        />
      ) : (
        <AjoutChantScreen
          onRetour={() => setEcran('bibliotheque')}
          onEnregistre={() => {
            setVersionBibliotheque((v) => v + 1);
            setEcran('bibliotheque');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  application: { flex: 1 },
  message: {
    flex: 1,
    backgroundColor: '#101A30',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  texte: { color: '#F5F1E8', marginTop: 16 },
  erreur: { color: '#FF9B9B', textAlign: 'center' },
});
