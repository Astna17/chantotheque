import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getCategories,
  creerCategorie,
  modifierCategorie,
  supprimerCategorie,
} from '../database/categories';
import { Categorie } from '../types';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [nouveauNom, setNouveauNom] = useState('');
  const [idEnEdition, setIdEnEdition] = useState<number | null>(null);
  const [nomEdition, setNomEdition] = useState('');

  // Recharge la liste
  useFocusEffect(
    useCallback(() => {
      chargerCategories();
    }, [])
  );

  function chargerCategories() {
    setCategories(getCategories());
  }

  function ajouter() {
    const nomPropre = nouveauNom.trim();
    if (nomPropre.length === 0) {
      Alert.alert('Erreur', 'Le nom de la catégorie ne peut pas être vide.');
      return;
    }
    try {
      creerCategorie(nomPropre);
      setNouveauNom('');
      chargerCategories();
    } catch (e) {
      Alert.alert('Erreur', 'Cette catégorie existe déjà.');
    }
  }

  function demarrerEdition(categorie: Categorie) {
    setIdEnEdition(categorie.id);
    setNomEdition(categorie.nom);
  }

  function validerEdition() {
    const nomPropre = nomEdition.trim();
    if (nomPropre.length === 0 || idEnEdition === null) return;
    try {
      modifierCategorie(idEnEdition, nomPropre);
      setIdEnEdition(null);
      setNomEdition('');
      chargerCategories();
    } catch (e) {
      Alert.alert('Erreur', 'Ce nom existe déjà.');
    }
  }

  function demanderSuppression(categorie: Categorie) {
    Alert.alert(
      'Supprimer',
      `Supprimer la catégorie "${categorie.nom}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            supprimerCategorie(categorie.id);
            chargerCategories();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* Formulaire d'ajout */}
      <View style={styles.formulaire}>
        <TextInput
          style={styles.input}
          placeholder="Nouvelle catégorie..."
          value={nouveauNom}
          onChangeText={setNouveauNom}
        />
        <TouchableOpacity style={styles.boutonAjouter} onPress={ajouter}>
          <Text style={styles.texteBouton}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des catégories */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.vide}>Aucune catégorie pour l'instant.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.ligne}>
            {idEnEdition === item.id ? (
              <>
                <TextInput
                  style={[styles.input, styles.inputEdition]}
                  value={nomEdition}
                  onChangeText={setNomEdition}
                  autoFocus
                />
                <TouchableOpacity onPress={validerEdition} style={styles.boutonPetit}>
                  <Text style={styles.texteBoutonPetit}>✓</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.nomCategorie}>{item.nom}</Text>
                <TouchableOpacity onPress={() => demarrerEdition(item)} style={styles.boutonPetit}>
                  <Text style={styles.texteBoutonPetit}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => demanderSuppression(item)} style={styles.boutonPetit}>
                  <Text style={styles.texteBoutonPetit}>🗑️</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  formulaire: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputEdition: { marginRight: 8 },
  boutonAjouter: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  texteBouton: { color: '#fff', fontWeight: 'bold' },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nomCategorie: { flex: 1, fontSize: 16 },
  boutonPetit: { paddingHorizontal: 10 },
  texteBoutonPetit: { fontSize: 18 },
  vide: { textAlign: 'center', color: '#999', marginTop: 40 },
});