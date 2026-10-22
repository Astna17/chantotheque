
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
};

export default function BibliothequeScreen({ onAjouter }: Props) {
  const [recherche, setRecherche] = useState('');
  const [onglet, setOnglet] = useState<Onglet>('Tous');
  const [chants, setChants] = useState<Chant[]>([]);
  const [chargement, setChargement] = useState(true);

  const chargerChants = useCallback(async () => {
    try {
      setChants(await obtenirChants());
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de charger les chants.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerChants();
  }, [chargerChants]);

  const filtres = chants.filter((chant) => {
    const terme = recherche.trim().toLowerCase();
    const texteCorrespond =
      chant.titre.toLowerCase().includes(terme) ||
      (chant.auteur ?? '').toLowerCase().includes(terme);
    return texteCorrespond &&
      (onglet !== 'Favoris' || chant.est_favori === 1);
  });

  async function basculerFavori(chant: Chant) {
    try {
      await changerFavori(chant.id, chant.est_favori !== 1);
      await chargerChants();
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de modifier le favori.');
    }
  }

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.contenu}>
        <Text style={s.surtitre}>VOTRE ESPACE MUSICAL</Text>
        <Text style={s.titre}>Ma bibliothèque</Text>
        <Text style={s.description}>Retrouvez vos chants de louange.</Text>

        <TextInput
          style={s.recherche}
          placeholder="Rechercher un chant ou un auteur..."
          placeholderTextColor="#9AA7BC"
          value={recherche}
          onChangeText={setRecherche}
        />

        <View style={s.onglets}>
          {(['Tous', 'Mes chants', 'Favoris'] as Onglet[]).map((item) => (
            <TouchableOpacity
              key={item}
              style={[s.onglet, onglet === item && s.ongletActif]}
              onPress={() => setOnglet(item)}
            >
              <Text style={[s.texteOnglet, onglet === item && s.texteOngletActif]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.enteteListe}>
          <Text style={s.sousTitre}>
            {onglet === 'Favoris' ? 'Mes favoris' : 'Mes chants'}
          </Text>
          <Text style={s.compteur}>
            {chargement ? 'Chargement...' : `${filtres.length} chant(s)`}
          </Text>
        </View>

        {chargement ? (
          <ActivityIndicator color={C.or} size="large" style={{ marginTop: 40 }} />
        ) : filtres.length === 0 ? (
          <View style={s.vide}>
            <Text style={s.iconeVide}>♫</Text>
            <Text style={s.texteVide}>
              {recherche ? 'Aucun résultat trouvé' :
                onglet === 'Favoris' ? 'Aucun favori pour le moment' :
                'Votre bibliothèque est vide'}
            </Text>
            <Text style={s.aideVide}>
              {recherche ? 'Essayez un autre titre ou auteur.' :
                'Ajoutez votre premier chant pour commencer.'}
            </Text>
          </View>
        ) : (
          filtres.map((chant) => (
            <View key={chant.id} style={s.carte}>
              <View style={s.pochette}>
                <Text style={s.iconeMusique}>♫</Text>
              </View>
              <View style={s.informations}>
                <Text style={s.titreChant}>{chant.titre}</Text>
                <Text style={s.auteur}>{chant.auteur || 'Auteur inconnu'}</Text>
              </View>
              <TouchableOpacity onPress={() => basculerFavori(chant)}>
                <Text style={s.favori}>{chant.est_favori === 1 ? '★' : '☆'}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={s.boutonAjouter} onPress={onAjouter}>
        <Text style={s.texteBouton}>＋  Ajouter un chant</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.fond },
  contenu: { padding: 22, paddingTop: 60, paddingBottom: 110 },
  surtitre: { color: C.or, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  titre: { color: C.ivoire, fontSize: 29, fontWeight: '700', marginTop: 10 },
  description: { color: C.secondaire, fontSize: 14, marginTop: 8, marginBottom: 24 },
  recherche: { backgroundColor: C.carte, color: C.ivoire, borderRadius: 14, padding: 16, fontSize: 14 },
  onglets: { flexDirection: 'row', gap: 8, marginTop: 22, marginBottom: 26 },
  onglet: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: C.carte },
  ongletActif: { backgroundColor: C.or },
  texteOnglet: { color: C.secondaire, fontSize: 12, fontWeight: '600' },
  texteOngletActif: { color: C.fond },
  enteteListe: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sousTitre: { color: C.ivoire, fontSize: 19, fontWeight: '700' },
  compteur: { color: C.secondaire, fontSize: 12 },
  carte: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.carte, borderRadius: 16, padding: 12, marginBottom: 12 },
  pochette: { width: 58, height: 58, borderRadius: 12, backgroundColor: C.fond, alignItems: 'center', justifyContent: 'center' },
  iconeMusique: { color: C.or, fontSize: 30 },
  informations: { flex: 1, marginLeft: 14 },
  titreChant: { color: C.ivoire, fontSize: 15, fontWeight: '700' },
  auteur: { color: C.secondaire, fontSize: 12, marginTop: 6 },
  favori: { color: C.or, fontSize: 25, paddingHorizontal: 8 },
  vide: { alignItems: 'center', paddingVertical: 48 },
  iconeVide: { color: C.or, fontSize: 52 },
  texteVide: { color: C.ivoire, fontSize: 17, fontWeight: '700', marginTop: 14, textAlign: 'center' },
  aideVide: { color: C.secondaire, fontSize: 13, textAlign: 'center', lineHeight: 21, marginTop: 8 },
  boutonAjouter: { position: 'absolute', bottom: 24, left: 22, right: 22, backgroundColor: C.or, paddingVertical: 17, borderRadius: 16, alignItems: 'center' },
  texteBouton: { color: C.fond, fontSize: 15, fontWeight: '700' },
});
