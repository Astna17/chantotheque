
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import {
  obtenirChantParId,
  type ChantDetail,
} from '../database/chants';

type Props = {
  chantId: number;
  onRetour: () => void;
  onChantModifie: () => void;
};

type Onglet = 'paroles' | 'partition' | 'versets';

const C = {
  fond: '#101A30',
  carte: '#263752',
  or: '#D6B66C',
  ivoire: '#F5F1E8',
  secondaire: '#C3CBDA',
  piste: '#43536B',
};

export default function DetailChantScreen({
  chantId,
  onRetour,
}: Props) {
  const [chant, setChant] = useState<ChantDetail | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);
  const [imageIndisponible, setImageIndisponible] = useState(false);
  const [ongletActif, setOngletActif] = useState<Onglet>('paroles');
  const [largeurPiste, setLargeurPiste] = useState(0);

  const player = useAudioPlayer(null);
  const statut = useAudioPlayerStatus(player);

  useEffect(() => {
    let actif = true;

    async function chargerChant() {
      try {
        setChargement(true);
        setErreur(false);
        setImageIndisponible(false);

        const resultat = await obtenirChantParId(chantId);

        if (actif) {
          setChant(resultat);
          setErreur(!resultat);
        }
      } catch (error) {
        console.error('Erreur de chargement du chant :', error);

        if (actif) {
          setErreur(true);
        }
      } finally {
        if (actif) {
          setChargement(false);
        }
      }
    }

    chargerChant();

    return () => {
      actif = false;
    };
  }, [chantId]);

  useEffect(() => {
    if (!chant?.audio_uri) return;

    try {
      player.replace({ uri: chant.audio_uri });
    } catch (error) {
      console.error('Erreur de préparation audio :', error);

      Alert.alert(
        'Audio indisponible',
        'Le fichier audio ne peut pas être chargé.',
      );
    }
  }, [chant?.audio_uri, player]);

  function basculerLecture() {
    if (!chant) return;

    try {
      if (statut.playing) {
        player.pause();
      } else {
        if (
          statut.duration > 0 &&
          statut.currentTime >= statut.duration
        ) {
          player.seekTo(0);
        }

        player.play();
      }
    } catch (error) {
      console.error('Erreur du lecteur audio :', error);

      Alert.alert(
        'Lecture impossible',
        'Impossible de lire ce fichier audio.',
      );
    }
  }

  function deplacerLecture(secondes: number) {
    const duree = statut.duration || 0;

    if (duree <= 0) return;

    const position = Math.max(
      0,
      Math.min((statut.currentTime || 0) + secondes, duree),
    );

    player.seekTo(position);
  }

  function choisirPosition(event: {
    nativeEvent: { locationX: number };
  }) {
    const duree = statut.duration || 0;

    if (duree <= 0 || largeurPiste <= 0) return;

    const positionX = Math.max(
      0,
      Math.min(event.nativeEvent.locationX, largeurPiste),
    );

    const nouvellePosition = (positionX / largeurPiste) * duree;

    player.seekTo(nouvellePosition);
  }

  function formaterTemps(secondes: number) {
    const valeur = Number.isFinite(secondes)
      ? Math.max(0, Math.floor(secondes))
      : 0;

    const minutes = Math.floor(valeur / 60);
    const reste = valeur % 60;

    return `${minutes}:${String(reste).padStart(2, '0')}`;
  }

  if (chargement) {
    return (
      <View style={s.centre}>
        <ActivityIndicator color={C.or} size="large" />
        <Text style={s.texteChargement}>
          Chargement du chant...
        </Text>
      </View>
    );
  }

  if (erreur || !chant) {
    return (
      <View style={s.centre}>
        <Text style={s.erreur}>
          Impossible de charger ce chant.
        </Text>

        <TouchableOpacity
          style={s.boutonRetour}
          onPress={onRetour}
          accessibilityRole="button"
        >
          <Text style={s.texteBoutonRetour}>
            ‹ Retour à la bibliothèque
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const duree = statut.duration || 0;
  const temps = statut.currentTime || 0;
  const progression = duree > 0
    ? Math.max(0, Math.min(temps / duree, 1))
    : 0;

  return (
    <ScrollView
      style={s.ecran}
      contentContainerStyle={s.contenu}
      showsVerticalScrollIndicator={false}
    >
      {/* Navigation */}
      <TouchableOpacity
        onPress={onRetour}
        style={s.retour}
        accessibilityRole="button"
      >
        <Text style={s.texteRetour}>‹ Bibliothèque</Text>
      </TouchableOpacity>

      {/* Couverture */}
      <View style={s.pochette}>
        {chant.image_uri && !imageIndisponible ? (
          <Image
            source={{ uri: chant.image_uri }}
            style={s.imagePochette}
            resizeMode="cover"
            onError={() => {
              console.warn(
                'Impossible de charger la couverture :',
                chant.titre,
              );
              setImageIndisponible(true);
            }}
          />
        ) : (
          <View style={s.pochetteParDefaut}>
            <Text style={s.iconeMusique}>♫</Text>
            <Text style={s.textePochette}>CHANTOTHÈQUE</Text>
          </View>
        )}

        <View style={s.badgeCouverture}>
          <Text style={s.texteBadgeCouverture}>♫ CHANT</Text>
        </View>
      </View>

      {/* Informations */}
      <Text style={s.titre}>{chant.titre}</Text>

      <Text style={s.auteur}>
        {chant.auteur || 'Auteur inconnu'}
      </Text>

      {/* Lecteur audio */}
      <View style={s.carteLecteur}>
        <View style={s.enteteLecteur}>
          <View>
            <Text style={s.titreLecteur}>Lecteur audio</Text>
            <Text style={s.sousTitreLecteur}>
              Écoute ton chant
            </Text>
          </View>

          <Text style={s.iconeEntete}>♫</Text>
        </View>

        {/* Commandes */}
        <View style={s.commandes}>
          <TouchableOpacity
            style={s.boutonSecondaire}
            onPress={() => deplacerLecture(-10)}
            accessibilityRole="button"
            accessibilityLabel="Reculer de 10 secondes"
          >
            <Text style={s.iconeSecondaire}>↶</Text>
            <Text style={s.texteSecondaireBouton}>10 s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.boutonLecture}
            onPress={basculerLecture}
            accessibilityRole="button"
            accessibilityLabel={
              statut.playing ? 'Mettre en pause' : 'Lire le chant'
            }
          >
            <Text style={s.iconeLecture}>
              {statut.playing ? 'Ⅱ' : '▶'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.boutonSecondaire}
            onPress={() => deplacerLecture(10)}
            accessibilityRole="button"
            accessibilityLabel="Avancer de 10 secondes"
          >
            <Text style={s.iconeSecondaire}>↷</Text>
            <Text style={s.texteSecondaireBouton}>10 s</Text>
          </TouchableOpacity>
        </View>

        {/* Barre de progression interactive */}
        <View style={s.zoneProgression}>
          <TouchableOpacity
            activeOpacity={1}
            style={s.zoneTactile}
            onLayout={(event) => {
              setLargeurPiste(event.nativeEvent.layout.width);
            }}
            onPress={choisirPosition}
            disabled={duree <= 0}
            accessibilityRole="adjustable"
            accessibilityLabel="Position de lecture"
            accessibilityValue={{
              min: 0,
              max: Math.floor(duree),
              now: Math.floor(temps),
            }}
          >
            <View style={s.piste}>
              <View
                style={[
                  s.progression,
                  { width: `${progression * 100}%` },
                ]}
              />
            </View>

            <View
              pointerEvents="none"
              style={[
                s.boutonCurseur,
                {
                  left: `${progression * 100}%`,
                  opacity: duree > 0 ? 1 : 0,
                },
              ]}
            />
          </TouchableOpacity>

          <View style={s.temps}>
            <Text style={s.texteTemps}>
              {formaterTemps(temps)}
            </Text>

            <Text style={s.texteTemps}>
              {formaterTemps(duree)}
            </Text>
          </View>

          <Text style={s.conseilProgression}>
            Touche la barre pour changer de passage
          </Text>
        </View>
      </View>

      {/* Onglets */}
      <View style={s.zoneContenu}>
        <View style={s.onglets}>
          <TouchableOpacity
            style={[
              s.onglet,
              ongletActif === 'paroles' && s.ongletSelectionne,
            ]}
            onPress={() => setOngletActif('paroles')}
            accessibilityRole="button"
            accessibilityState={{
              selected: ongletActif === 'paroles',
            }}
          >
            <Text
              style={[
                s.iconeOnglet,
                ongletActif === 'paroles' && s.iconeOngletSelectionne,
              ]}
            >
              ♫
            </Text>
            <Text
              style={[
                s.texteOnglet,
                ongletActif === 'paroles' && s.texteOngletSelectionne,
              ]}
            >
              Paroles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              s.onglet,
              ongletActif === 'partition' && s.ongletSelectionne,
            ]}
            onPress={() => setOngletActif('partition')}
            accessibilityRole="button"
            accessibilityState={{
              selected: ongletActif === 'partition',
            }}
          >
            <Text
              style={[
                s.iconeOnglet,
                ongletActif === 'partition' && s.iconeOngletSelectionne,
              ]}
            >
              ♬
            </Text>
            <Text
              style={[
                s.texteOnglet,
                ongletActif === 'partition' && s.texteOngletSelectionne,
              ]}
            >
              Partition
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              s.onglet,
              ongletActif === 'versets' && s.ongletSelectionne,
            ]}
            onPress={() => setOngletActif('versets')}
            accessibilityRole="button"
            accessibilityState={{
              selected: ongletActif === 'versets',
            }}
          >
            <Text
              style={[
                s.iconeOnglet,
                ongletActif === 'versets' && s.iconeOngletSelectionne,
              ]}
            >
              ✝
            </Text>
            <Text
              style={[
                s.texteOnglet,
                ongletActif === 'versets' && s.ongletSelectionne,
              ]}
            >
              Versets
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenu des onglets */}
        <View style={s.contenuOnglet}>
          {ongletActif === 'paroles' && (
            <>
              <Text style={s.titreSection}>PAROLES DU CHANT</Text>
              <Text style={s.paroles}>
                {chant.paroles?.trim() ||
                  'Aucune parole enregistrée pour ce chant.'}
              </Text>
            </>
          )}

          {ongletActif === 'partition' && (
            <>
              <Text style={s.titreSection}>PARTITION MUSICALE</Text>

              {chant.partition_uri ? (
                <View style={s.messageDisponible}>
                  <Text style={s.iconeDisponible}>♫</Text>
                  <Text style={s.texteDescription}>
                    Une partition est enregistrée pour ce chant.
                  </Text>
                  <Text style={s.texteAide}>
                    L’affichage du fichier de partition sera ajouté
                    dans une prochaine étape.
                  </Text>
                </View>
              ) : (
                <Text style={s.texteDescription}>
                  Aucune partition enregistrée pour ce chant.
                </Text>
              )}
            </>
          )}

          {ongletActif === 'versets' && (
            <>
              <Text style={s.titreSection}>VERSETS BIBLIQUES</Text>

              {chant.versets.length > 0 ? (
                chant.versets.map((verset) => (
                  <View key={verset.id} style={s.carteVerset}>
                    <Text style={s.reference}>
                      {verset.reference_biblique || 'Référence biblique'}
                    </Text>
                    <Text style={s.texteVerset}>{verset.texte}</Text>
                  </View>
                ))
              ) : (
                <Text style={s.texteDescription}>
                  Aucun verset biblique enregistré pour ce chant.
                </Text>
              )}
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  ecran: {
    flex: 1,
    backgroundColor: C.fond,
  },
  contenu: {
    padding: 22,
    paddingBottom: 40,
  },
  centre: {
    flex: 1,
    backgroundColor: C.fond,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  texteChargement: {
    color: C.ivoire,
    marginTop: 14,
  },
  erreur: {
    color: '#FF9B9B',
    fontSize: 16,
    textAlign: 'center',
  },
  retour: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    marginBottom: 22,
  },
  texteRetour: {
    color: C.or,
    fontSize: 16,
    fontWeight: '600',
  },
  boutonRetour: {
    marginTop: 20,
    padding: 12,
  },
  texteBoutonRetour: {
    color: C.or,
    fontWeight: '600',
  },

  /* Couverture */
  pochette: {
    height: 260,
    borderRadius: 24,
    backgroundColor: C.carte,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3A4D69',
    overflow: 'hidden',
    position: 'relative',
  },
  imagePochette: {
    width: '100%',
    height: '100%',
  },
  pochetteParDefaut: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeMusique: {
    color: C.or,
    fontSize: 90,
  },
  textePochette: {
    color: C.secondaire,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: -12,
  },
  badgeCouverture: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(16, 26, 48, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  texteBadgeCouverture: {
    color: C.or,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  /* Informations */
  titre: {
    color: C.ivoire,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  auteur: {
    color: C.secondaire,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 26,
  },

  /* Lecteur */
  carteLecteur: {
    backgroundColor: C.carte,
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#354763',
  },
  enteteLecteur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titreLecteur: {
    color: C.ivoire,
    fontSize: 17,
    fontWeight: '800',
  },
  sousTitreLecteur: {
    color: C.secondaire,
    fontSize: 12,
    marginTop: 4,
  },
  iconeEntete: {
    color: C.or,
    fontSize: 27,
  },
  commandes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  boutonSecondaire: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#344762',
  },
  iconeSecondaire: {
    color: C.ivoire,
    fontSize: 25,
    fontWeight: '700',
  },
  texteSecondaireBouton: {
    color: C.secondaire,
    fontSize: 10,
    marginTop: -2,
  },
  boutonLecture: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.or,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeLecture: {
    color: C.fond,
    fontSize: 28,
    fontWeight: '900',
  },
  zoneProgression: {
    marginTop: 24,
  },
  zoneTactile: {
    height: 30,
    justifyContent: 'center',
    position: 'relative',
  },
  piste: {
    height: 7,
    borderRadius: 4,
    backgroundColor: C.piste,
    overflow: 'hidden',
  },
  progression: {
    height: '100%',
    backgroundColor: C.or,
    borderRadius: 4,
  },
  boutonCurseur: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: C.or,
    borderWidth: 2,
    borderColor: C.ivoire,
    top: 7.5,
    marginLeft: -7.5,
  },
  temps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  texteTemps: {
    color: C.secondaire,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  conseilProgression: {
    color: C.secondaire,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },

  /* Onglets */
  zoneContenu: {
    marginBottom: 26,
  },
  onglets: {
    flexDirection: 'row',
    backgroundColor: C.carte,
    borderRadius: 14,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  onglet: {
    flex: 1,
    minHeight: 58,
    paddingHorizontal: 2,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ongletSelectionne: {
    backgroundColor: C.or,
  },
  iconeOnglet: {
    color: C.ivoire,
    fontSize: 17,
    marginBottom: 3,
  },
  iconeOngletSelectionne: {
    color: C.fond,
  },
  texteOnglet: {
    color: C.secondaire,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  texteOngletSelectionne: {
    color: C.fond,
  },

  /* Contenu des onglets */
  contenuOnglet: {
    backgroundColor: C.carte,
    borderRadius: 16,
    padding: 17,
    minHeight: 160,
    borderWidth: 1,
    borderColor: '#354763',
  },
  titreSection: {
    color: C.or,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  paroles: {
    color: C.ivoire,
    fontSize: 16,
    lineHeight: 29,
  },
  texteDescription: {
    color: C.secondaire,
    fontSize: 14,
    lineHeight: 23,
  },
  texteAide: {
    color: C.secondaire,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 12,
  },
  messageDisponible: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconeDisponible: {
    color: C.or,
    fontSize: 35,
    marginBottom: 12,
  },

  /* Versets */
  carteVerset: {
    backgroundColor: '#1D2C44',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.or,
  },
  reference: {
    color: C.or,
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 8,
  },
  texteVerset: {
    color: C.ivoire,
    fontSize: 15,
    lineHeight: 24,
  },
});
