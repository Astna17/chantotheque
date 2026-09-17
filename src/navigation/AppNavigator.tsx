import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccueilScreen from '../screens/AccueilScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import AjoutChantScreen from '../screens/AjoutChantScreen';
import DetailChantScreen from '../screens/DetailChantScreen';
import ChantsCategorieScreen from '../screens/ChantsCategorieScreen';

//ici tous les écrans de l'app 
export type RootStackParamList = {
  Accueil: undefined;
  Categories: undefined;   
  AjoutChant: { chantId?: number } | undefined; 
  DetailChant: { chantId: number }; 
  ChantsCategorie: {categorieId: number; categorieNom: string};
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
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{ title: 'Catégories'}}
        />
        <Stack.Screen
          name="AjoutChant"
          component={AjoutChantScreen}
          options={{ title: 'Ajouter un chant' }}
        />
        <Stack.Screen
          name="DetailChant"
          component={DetailChantScreen}
          options={{ title: 'Détails du chant' }}
        />
        <Stack.Screen
          name="ChantsCategorie"
          component={ChantsCategorieScreen}
          options={({ route }) => ({
            title: route.params.categorieNom
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}