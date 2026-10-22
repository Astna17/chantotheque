
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
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

const C = {
  fond: '#101A30',
  carte: '#263752',
  or: '#D6B66C',
  ivoire: '#F5F1E8',
  secondaire: '#C3CBDA',
};

type Onglet = 'Tous' | 'Mes chants' | 'Favoris';

type Props = {
  onAjouter: () => void;
  onOuvrirChant: (id: number) => void;
};

export default function BibliothequeScreen({
  onAjouter,
  onOuvrirChant,
}: Props) {
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

  const terme = recherche.trim().toLowerCase();

  const filtres = chants.filter((chant) => {
    const texteCorrespond =
      chant.titre.toLowerCase().includes(terme) ||
      (chant.auteur ?? '').toLowerCase().includes(terme);

    return (
      texteCorrespond &&
      (onglet !== 'Favoris' || chant.est_favori === 1)
    );
  });

  async function basculerFavori(chant: Chant) {
    try {
      await changerFavori(chant.id, chant.est_favori !== 1);
      await chargerChants();
    } catch (error) {
      console.error('Erreur de modification du favori :', error);
      Alert.alert('Erreur', 'Impossible de modifier le favori.');
    }
  }

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={s.contenu}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* En-tête */}
        <Text style={s.surtitre}>VOTRE ESPACE MUSICAL</Text>

        <Text style={s.titre}>Ma bibliothèque</Text>

        <Text style={s.description}>
          Retrouvez vos chants de louange.
        </Text>

        {/* Recherche */}
        <View style={s.zoneRecherche}>
          <Text style={s.iconeRecherche}>⌕</Text>

          <TextInput
            style={s.recherche}
            placeholder="Rechercher un chant ou un auteur..."
            placeholderTextColor="#9AA7BC"
            value={recherche}
            onChangeText={setRecherche}
            returnKeyType="search"
            accessibilityLabel="Rechercher un chant ou un auteur"
          />

          {recherche.length > 0 && (
            <TouchableOpacity
              onPress={() => setRecherche('')}
              style={s.effacerRecherche}
              accessibilityRole="button"
              accessibilityLabel="Effacer la recherche"
            >
              <Text style={s.texteEffacer}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtres */}
        <View style={s.onglets}>
          {(['Tous', 'Mes chants', 'Favoris'] as Onglet[]).map(
            (item) => (
              <TouchableOpacity
                key={item}
                style={[
                  s.onglet,
                  onglet === item && s.ongletActif,
                ]}
                onPress={() => setOnglet(item)}
                accessibilityRole="button"
                accessibilityState={{ selected: onglet === item }}
              >
                <Text
                  style={[
                    s.texteOnglet,
                    onglet === item && s.texteOngletActif,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        {/* En-tête de la liste */}
        <View style={s.enteteListe}>
          <Text style={s.sousTitre}>
            {onglet === 'Favoris' ? 'Mes favoris' : 'Mes chants'}
          </Text>

          <Text style={s.compteur}>
            {chargement
              ? 'Chargement...'
              : `${filtres.length} chant(s)`}
          </Text>
        </View>

        {/* Chargement */}
        {chargement ? (
          <ActivityIndicator
            color={C.or}
            size="large"
            style={s.indicateur}
          />
        ) : filtres.length === 0 ? (
          /* Bibliothèque vide */
          <View style={s.vide}>
            <View style={s.iconeVideConteneur}>
              <Text style={s.iconeVide}>♫</Text>
            </View>

            <Text style={s.texteVide}>
              {recherche
                ? 'Aucun résultat trouvé'
                : onglet === 'Favoris'
                  ? 'Aucun favori pour le moment'
                  : 'Votre bibliothèque est vide'}
            </Text>

            <Text style={s.aideVide}>
              {recherche
                ? 'Essayez un autre titre ou auteur.'
                : onglet === 'Favoris'
                  ? 'Ajoutez des chants à vos favoris avec l’étoile.'
                  : 'Ajoutez votre premier chant pour commencer.'}
            </Text>

            {!recherche && onglet !== 'Favoris' && (
              <TouchableOpacity
                style={s.boutonVide}
                onPress={onAjouter}
                activeOpacity={0.8}
              >
                <Text style={s.texteBoutonVide}>
                  ＋ Ajouter un chant
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Liste des chants */
          filtres.map((chant) => (
            <View key={chant.id} style={s.carte}>
              <TouchableOpacity
                style={s.zoneChant}
                activeOpacity={0.75}
                onPress={() => onOuvrirChant(chant.id)}
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir ${chant.titre}`}
              >
                {/* Couverture du chant */}
                <View style={s.pochette}>
                  {chant.image_uri ? (
                    <Image
                      source={{ uri: chant.image_uri }}
                      style={s.imagePochette}
                      resizeMode="cover"
                      onError={() => {
                        console.warn(
                          `Impossible de charger la couverture du chant : ${chant.titre}`,
                        );
                      }}
                    />
                  ) : (
                    <Text style={s.iconeMusique}>♫</Text>
                  )}
                </View>

                {/* Informations */}
                <View style={s.informations}>
                  <Text style={s.titreChant} numberOfLines={2}>
                    {chant.titre}
                  </Text>

                  <Text style={s.auteur} numberOfLines={1}>
                    {chant.auteur || 'Auteur inconnu'}
                  </Text>

                  <Text style={s.ouvrirDetail}>
                    Écouter le chant ›
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Favori */}
              <TouchableOpacity
                style={s.boutonFavori}
                onPress={() => basculerFavori(chant)}
                accessibilityRole="button"
                accessibilityLabel={
                  chant.est_favori === 1
                    ? 'Retirer des favoris'
                    : 'Ajouter aux favoris'
                }
              >
                <Text style={s.favori}>
                  {chant.est_favori === 1 ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Bouton fixe d'ajout */}
      <TouchableOpacity
        style={s.boutonAjouter}
        onPress={onAjouter}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Text style={s.texteBouton}>
          ＋  Ajouter un chant
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.fond,
  },
  contenu: {
    padding: 22,
    paddingTop: 60,
    paddingBottom: 120,
  },
  surtitre: {
    color: C.or,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  titre: {
    color: C.ivoire,
    fontSize: 29,
    fontWeight: '700',
    marginTop: 10,
  },
  description: {
    color: C.secondaire,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  zoneRecherche: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.carte,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 54,
  },
  iconeRecherche: {
    color: C.secondaire,
    fontSize: 25,
    marginRight: 8,
  },
  recherche: {
    flex: 1,
    minWidth: 0,
    color: C.ivoire,
    paddingVertical: 15,
    fontSize: 14,
  },
  effacerRecherche: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  texteEffacer: {
    color: C.secondaire,
    fontSize: 24,
  },
  onglets: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
    marginBottom: 26,
  },
  onglet: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.carte,
  },
  ongletActif: {
    backgroundColor: C.or,
  },
  texteOnglet: {
    color: C.secondaire,
    fontSize: 12,
    fontWeight: '600',
  },
  texteOngletActif: {
    color: C.fond,
  },
  enteteListe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sousTitre: {
    color: C.ivoire,
    fontSize: 19,
    fontWeight: '700',
  },
  compteur: {
    color: C.secondaire,
    fontSize: 12,
  },
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.carte,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#354763',
  },
  zoneChant: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  pochette: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: C.fond,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePochette: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  iconeMusique: {
    color: C.or,
    fontSize: 30,
  },
  informations: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  titreChant: {
    color: C.ivoire,
    fontSize: 15,
    fontWeight: '700',
  },
  auteur: {
    color: C.secondaire,
    fontSize: 12,
    marginTop: 6,
  },
  ouvrirDetail: {
    color: C.or,
    fontSize: 12,
    marginTop: 7,
    fontWeight: '600',
  },
  boutonFavori: {
    paddingLeft: 10,
    paddingVertical: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favori: {
    color: C.or,
    fontSize: 25,
  },
  indicateur: {
    marginTop: 40,
  },
  vide: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 48,
  },
  iconeVideConteneur: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: C.carte,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconeVide: {
    color: C.or,
    fontSize: 52,
  },
  texteVide: {
    color: C.ivoire,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
  },
  aideVide: {
    color: C.secondaire,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },
  boutonVide: {
    backgroundColor: C.or,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 22,
  },
  texteBoutonVide: {
    color: C.fond,
    fontSize: 14,
    fontWeight: '700',
  },
  boutonAjouter: {
    position: 'absolute',
    bottom: 24,
    left: 22,
    right: 22,
    backgroundColor: C.or,
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 5,
  },
  texteBouton: {
    color: C.fond,
    fontSize: 15,
    fontWeight: '700',
  },
});
