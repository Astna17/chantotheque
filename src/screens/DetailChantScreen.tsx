import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  useFocusEffect,
  useRoute,
  useNavigation,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getChantDetail } from '../database/chants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ChantDetail } from '../types';
import LecteurAudio from '../components/LecteurAudio';
import { couleurs, rayons, espacements } from '../theme';

type DetailChantRouteProp = RouteProp<
  RootStackParamList,
  'DetailChant'
>;

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DetailChant'
>;

type Onglet = 'paroles' | 'solfege' | 'versets';

export default function DetailChantScreen() {
  const route = useRoute<DetailChantRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { chantId } = route.params;

  const [chant, setChant] = useState<ChantDetail | null>(null);
  const [ongletActif, setOngletActif] =
    useState<Onglet>('paroles');

  useFocusEffect(
    useCallback(() => {
      const resultat = getChantDetail(chantId);
      setChant(resultat);
    }, [chantId])
  );

  if (!chant) {
    return (
      <View style={styles.ecranVide}>
        <Text style={styles.messageVide}>
          Chant introuvable.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.boutonRetourVide}
          accessibilityRole="button"
        >
          <Text style={styles.texteRetour}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chantActuel: ChantDetail = chant;

  function afficherContenu(chantDetail: ChantDetail) {
    switch (ongletActif) {
      case 'paroles':
        return chantDetail.paroles?.trim() ? (
          <Text style={styles.texteContenu}>
            {chantDetail.paroles}
          </Text>
        ) : (
          <Text style={styles.contenuVide}>
            Aucune parole enregistrée pour ce chant.
          </Text>
        );

      case 'solfege':
        return chantDetail.solfege?.trim() ? (
          <Text style={styles.texteContenu}>
            {chantDetail.solfege}
          </Text>
        ) : (
          <Text style={styles.contenuVide}>
            Aucun solfège enregistré pour ce chant.
          </Text>
        );

      case 'versets':
        return chantDetail.versets.length > 0 ? (
          chantDetail.versets.map((verset) => (
            <View key={verset.id} style={styles.verset}>
              <Text style={styles.referenceVerset}>
                {verset.reference}
              </Text>
              <Text style={styles.texteVerset}>
                {verset.texte}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.contenuVide}>
            Aucun verset biblique associé à ce chant.
          </Text>
        );

      default:
        return null;
    }
  }

  const titreContenu: Record<Onglet, string> = {
    paroles: 'PAROLES',
    solfege: 'SOLFÈGE',
    versets: 'VERSETS BIBLIQUES',
  };

  const onglets: { id: Onglet; label: string }[] = [
    { id: 'paroles', label: 'Paroles' },
    { id: 'solfege', label: 'Solfège' },
    { id: 'versets', label: 'Versets' },
  ];

  return (
    <View style={styles.ecran}>
      {/* En-tête */}
      <View style={styles.entete}>
        <TouchableOpacity
          style={styles.boutonRetour}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Retour à la liste des chants"
        >
          <Text style={styles.iconeRetour}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.titreEntete}>
          Détails du chant
        </Text>

        <View style={styles.espaceEntete} />
      </View>

      {/* Pochette, titre et lecteur audio */}
      <View style={styles.zoneLecteur}>
        <View style={styles.pochetteConteneur}>
          {chantActuel.imageUri ? (
            <Image
              source={{ uri: chantActuel.imageUri }}
              style={styles.pochette}
              resizeMode="cover"
              accessibilityLabel={`Pochette de ${chantActuel.titre}`}
            />
          ) : (
            <View style={styles.pochetteVide}>
              <Text style={styles.iconeMusique}>♫</Text>
              <Text style={styles.textePochetteVide}>
                Aucune pochette
              </Text>
            </View>
          )}
        </View>

        <View style={styles.informationsChant}>
          <Text style={styles.titreChant} numberOfLines={2}>
            {chantActuel.titre}
          </Text>

          <Text style={styles.auteurChant} numberOfLines={1}>
            {chantActuel.auteur?.trim() || 'Auteur non renseigné'}
          </Text>
        </View>

        <LecteurAudio
          uriAudio={chantActuel.audioUri}
          titre={chantActuel.titre}
          imageUri={chantActuel.imageUri}
        />
      </View>

      {/* Onglets */}
      <View style={styles.barreOnglets}>
        {onglets.map((onglet) => {
          const actif = ongletActif === onglet.id;

          return (
            <TouchableOpacity
              key={onglet.id}
              style={[
                styles.onglet,
                actif && styles.ongletActif,
              ]}
              onPress={() => setOngletActif(onglet.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: actif }}
            >
              <Text
                style={[
                  styles.texteOnglet,
                  actif && styles.texteOngletActif,
                ]}
              >
                {onglet.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Zone de contenu défilante */}
      <ScrollView
        key={ongletActif}
        style={styles.zoneContenu}
        contentContainerStyle={styles.contenuInterieur}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.enteteContenu}>
          <Text style={styles.titreContenu}>
            {titreContenu[ongletActif]}
          </Text>
        </View>

        {afficherContenu(chantActuel)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  ecranVide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacements.lg,
    backgroundColor: couleurs.fond,
  },

  messageVide: {
    fontSize: 16,
    color: couleurs.texte,
  },

  boutonRetourVide: {
    marginTop: espacements.md,
    paddingHorizontal: espacements.lg,
    paddingVertical: espacements.sm,
    backgroundColor: couleurs.accent,
    borderRadius: rayons.moyen,
  },

  texteRetour: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  entete: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espacements.md,
  },

  boutonRetour: {
    width: 40,
    height: 44,
    justifyContent: 'center',
  },

  iconeRetour: {
    fontSize: 36,
    lineHeight: 40,
    color: couleurs.texte,
  },

  titreEntete: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: couleurs.texte,
  },

  espaceEntete: {
    width: 40,
  },

  zoneLecteur: {
    paddingHorizontal: espacements.md,
    paddingTop: espacements.sm,
    paddingBottom: espacements.md,
    backgroundColor: '#FFFFFF',
  },

  pochetteConteneur: {
    width: 220,
    height: 220,
    maxWidth: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: rayons.moyen,
    backgroundColor: couleurs.fond,
  },

  pochette: {
    width: '100%',
    height: '100%',
  },

  pochetteVide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconeMusique: {
    fontSize: 52,
    color: couleurs.accent,
  },

  textePochetteVide: {
    marginTop: espacements.sm,
    fontSize: 12,
    color: couleurs.texteSecondaire,
  },

  informationsChant: {
    marginTop: espacements.md,
    marginBottom: espacements.xs,
    alignItems: 'center',
  },

  titreChant: {
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
    color: couleurs.texte,
  },

  auteurChant: {
    marginTop: espacements.xs,
    fontSize: 14,
    color: couleurs.texteSecondaire,
  },

  barreOnglets: {
    flexDirection: 'row',
    paddingHorizontal: espacements.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D8DCE5',
  },

  onglet: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 2,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },

  ongletActif: {
    borderBottomColor: couleurs.accent,
  },

  texteOnglet: {
    fontSize: 12,
    fontWeight: '600',
    color: couleurs.texteSecondaire,
  },

  texteOngletActif: {
    color: couleurs.accent,
    fontWeight: '800',
  },

  zoneContenu: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  contenuInterieur: {
    paddingHorizontal: espacements.lg,
    paddingTop: espacements.md,
    paddingBottom: espacements.xl,
  },

  enteteContenu: {
    marginBottom: espacements.md,
  },

  titreContenu: {
    color: couleurs.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  texteContenu: {
    color: couleurs.texte,
    fontSize: 15,
    lineHeight: 26,
  },

  contenuVide: {
    color: couleurs.texteSecondaire,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },

  verset: {
    borderLeftWidth: 3,
    borderLeftColor: couleurs.accent,
    paddingLeft: espacements.md,
    marginBottom: espacements.lg,
  },

  referenceVerset: {
    color: couleurs.texte,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: espacements.xs,
  },

  texteVerset: {
    color: couleurs.texteSecondaire,
    fontSize: 14,
    lineHeight: 23,
    fontStyle: 'italic',
  },
});