import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  obtenirChants,
  changerFavori,
  type Chant,
} from '../database/chants';

const COULEURS = {
  fond: '#101A30',
  carte: '#263752',
  or: '#D6B66C',
  ivoire: '#F5F1E8',
  secondaire: '#C3CBDA',
};

type Onglet = 'Tous' | 'Mes chants' | 'Favoris';

export default function BibliothequeScreen() {
  const [recherche, setRecherche] = useState('');
  const [onglet, setOnglet] = useState<Onglet>('Tous');
  const [chants, setChants] = useState<Chant[]>([]);
  const [chargement, setChargement] = useState(true);

  const chargerChants = useCallback(async () => {
    try {
      const resultat = await obtenirChants();
      setChants(resultat);
    } catch (error) {
      console.error('Erreur de chargement des chants :', error);
      Alert.alert('Erreur', 'Impossible de charger les chants.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerChants();
  }, [chargerChants]);

  const chantsFiltres = chants.filter((chant) => {
    const terme = recherche.trim().toLowerCase();

    const correspondRecherche =
      chant.titre.toLowerCase().includes(terme) ||
      (chant.auteur ?? '').toLowerCase().includes(terme);

    const correspondOnglet =
      onglet !== 'Favoris' || chant.est_favori === 1;

    return correspondRecherche && correspondOnglet;
  });

  const basculerFavori = async (chant: Chant) => {
    try {
      await changerFavori(chant.id, chant.est_favori !== 1);
      await chargerChants();
    } catch (error) {
      console.error('Erreur favori :', error);
      Alert.alert('Erreur', 'Impossible de modifier le favori.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contenu}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.surtitre}>VOTRE ESPACE MUSICAL</Text>
        <Text style={styles.titre}>Ma bibliothèque</Text>
        <Text style={styles.description}>
          Retrouvez vos chants de louange.
        </Text>

        <TextInput
          style={styles.recherche}
          placeholder="Rechercher un chant ou un auteur..."
          placeholderTextColor="#9AA7BC"
          value={recherche}
          onChangeText={setRecherche}
          autoCapitalize="none"
        />

        <View style={styles.onglets}>
          {(['Tous', 'Mes chants', 'Favoris'] as Onglet[]).map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.onglet,
                onglet === item && styles.ongletActif,
              ]}
              onPress={() => setOnglet(item)}
            >
              <Text
                style={[
                  styles.texteOnglet,
                  onglet === item && styles.texteOngletActif,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.enteteListe}>
          <Text style={styles.sousTitre}>
            {onglet === 'Favoris' ? 'Mes favoris' : 'Mes chants'}
          </Text>
          <Text style={styles.compteur}>
            {chargement ? 'Chargement...' : `${chantsFiltres.length} chant(s)`}
          </Text>
        </View>

        {chargement ? (
          <ActivityIndicator
            color={COULEURS.or}
            size="large"
            style={styles.indicateur}
          />
        ) : chantsFiltres.length === 0 ? (
          <View style={styles.vide}>
            <Text style={styles.iconeVide}>♫</Text>
            <Text style={styles.texteVide}>
              {recherche
                ? 'Aucun résultat trouvé'
                : onglet === 'Favoris'
                  ? 'Aucun favori pour le moment'
                  : 'Votre bibliothèque est vide'}
            </Text>
            <Text style={styles.aideVide}>
              {recherche
                ? 'Essayez un autre titre ou nom d’auteur.'
                : 'Ajoutez votre premier chant pour commencer.'}
            </Text>
          </View>
        ) : (
          chantsFiltres.map((chant) => (
            <View key={chant.id} style={styles.carte}>
              <View style={styles.pochette}>
                <Text style={styles.iconeMusique}>♫</Text>
              </View>

              <View style={styles.informations}>
                <Text style={styles.titreChant} numberOfLines={2}>
                  {chant.titre}
                </Text>
                <Text style={styles.auteur} numberOfLines={1}>
                  {chant.auteur || 'Auteur inconnu'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.boutonFavori}
                onPress={() => basculerFavori(chant)}
                accessibilityRole="button"
                accessibilityLabel="Modifier le favori"
              >
                <Text style={styles.favori}>
                  {chant.est_favori === 1 ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.boutonAjouter}
        onPress={() =>
          Alert.alert(
            'Ajout d’un chant',
            'Le formulaire sera créé à la prochaine étape.',
          )
        }
      >
        <Text style={styles.texteBouton}>＋  Ajouter un chant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COULEURS.fond },
  contenu: { padding: 22, paddingTop: 60, paddingBottom: 110 },
  surtitre: {
    color: COULEURS.or, fontSize: 11, fontWeight: '700', letterSpacing: 2,
  },
  titre: {
    color: COULEURS.ivoire, fontSize: 29, fontWeight: '700', marginTop: 10,
  },
  description: {
    color: COULEURS.secondaire, fontSize: 14, marginTop: 8, marginBottom: 24,
  },
  recherche: {
    backgroundColor: COULEURS.carte, color: COULEURS.ivoire,
    borderRadius: 14, padding: 16, fontSize: 14,
  },
  onglets: {
    flexDirection: 'row', gap: 8, marginTop: 22, marginBottom: 26,
  },
  onglet: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: 12, backgroundColor: COULEURS.carte,
  },
  ongletActif: { backgroundColor: COULEURS.or },
  texteOnglet: {
    color: COULEURS.secondaire, fontSize: 12, fontWeight: '600',
  },
  texteOngletActif: { color: COULEURS.fond },
  enteteListe: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  sousTitre: { color: COULEURS.ivoire, fontSize: 19, fontWeight: '700' },
  compteur: { color: COULEURS.secondaire, fontSize: 12 },
  indicateur: { marginTop: 40 },
  carte: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COULEURS.carte, borderRadius: 16,
    padding: 12, marginBottom: 12,
  },
  pochette: {
    width: 58, height: 58, borderRadius: 12,
    backgroundColor: COULEURS.fond,
    alignItems: 'center', justifyContent: 'center',
  },
  iconeMusique: { color: COULEURS.or, fontSize: 30 },
  informations: { flex: 1, marginLeft: 14 },
  titreChant: { color: COULEURS.ivoire, fontSize: 15, fontWeight: '700' },
  auteur: { color: COULEURS.secondaire, fontSize: 12, marginTop: 6 },
  boutonFavori: { paddingHorizontal: 8, paddingVertical: 6 },
  favori: { color: COULEURS.or, fontSize: 25 },
  vide: { alignItems: 'center', paddingVertical: 48 },
  iconeVide: { color: COULEURS.or, fontSize: 52 },
  texteVide: {
    color: COULEURS.ivoire, fontSize: 17, fontWeight: '700',
    marginTop: 14, textAlign: 'center',
  },
  aideVide: {
    color: COULEURS.secondaire, fontSize: 13, textAlign: 'center',
    lineHeight: 21, marginTop: 8,
  },
  boutonAjouter: {
    position: 'absolute', bottom: 24, left: 22, right: 22,
    backgroundColor: COULEURS.or, paddingVertical: 17,
    borderRadius: 16, alignItems: 'center',
  },
  texteBouton: { color: COULEURS.fond, fontSize: 15, fontWeight: '700' },
});
