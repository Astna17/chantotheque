import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccueilScreen from '../screens/AccueilScreen';

//ici tous les écrans de l'app 
export type RootStackParamList = {
  Accueil: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Accueil">
        <Stack.Screen
          name="Accueil"
          component={AccueilScreen}
          options={{ title: 'Chantothèque' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}