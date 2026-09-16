import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { initDatabase } from './src/database/init';
import { initDossiersFichiers } from './src/database/fichier';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [pret, setPret] = useState(false);

  useEffect(() => {
    async function preparer() {
      initDatabase();
      await initDossiersFichiers();
      setPret(true);
    }
    preparer();
  }, []);

  if (!pret) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AppNavigator />;
}