import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { initDatabase } from './src/database/init';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [pret, setPret] = useState(false);

  useEffect(() => {
    initDatabase();
    setPret(true);
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