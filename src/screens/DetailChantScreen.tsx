
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

const C = {
  fond: '#101A30',
  carte: '#263752',
  or: '#D6B66C',
  ivoire: '#F5F1E8',
  secondaire: '#C3CBDA',
};

export default function DetailChantScreen({
  chantId,
  onRetour,
}: Props) {
  const [chant, setChant] = useState<ChantDetail | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  const player = useAudioPlayer(null);
  const statut = useAudioPlayerStatus(player);

  useEffect(() => {
    let actif = true;

    async function chargerChant() {
      try {
        setChargement(true);
        setErreur(false);

        const resultat = await obtenirChantParId(chantId);

        if (actif) {
          setChant(resultat);

          if (!resultat) {
            setErreur(true);
          }
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
  }, [chantId, player]);

  useEffect(() => {
    if (!chant?.audio_uri) return;

    try {
      player.replace({ uri: chant.audio_uri });
    } catch (error) {
      console.error('Erreur de préparation audio :', error);
    }
  }, [chant?.audio_uri, player]);

  function basculerLecture() {
    if (!chant) return;

    try {
      if (statut.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch (error) {
      console.error('Erreur du lecteur audio :', error);
      Alert.alert('Lecture impossible', 'Impossible de lire ce fichier audio.');
    }
  }

  function formaterTemps(secondes: number) {
    const valeur = Number.isFinite(secondes) ? Math.floor(secondes) : 0;
    const minutes = Math.floor(valeur / 60);
    const reste = valeur % 60;

    return `${minutes}:${String(reste).padStart(2, '0')}`;
  }

  if (chargement) {
    return (
      <View style={s.centre}>
        <ActivityIndicator color={C.or} size="large" />
        <Text style={s.texteChargement}>Chargement du chant...</Text>
      </View>
    );
  }

  if (erreur || !chant) {
    return (
      <View style={s.centre}>
        <Text style={s.erreur}>Impossible de charger ce chant.</Text>
        <TouchableOpacity style={s.boutonRetour} onPress={onRetour}>
          <Text style={s.texteBoutonRetour}>‹ Retour à la bibliothèque</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const duree = statut.duration || 0;
  const temps = statut.currentTime || 0;
  const progression = duree > 0 ? Math.min(temps / duree, 1) : 0;

  return (
    <ScrollView
      style={s.ecran}
      contentContainerStyle={s.contenu}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={onRetour} style={s.retour}>
        <Text style={s.texteRetour}>‹  Bibliothèque</Text>
      </TouchableOpacity>

      <View style={s.pochette}>
        <Text style={s.iconeMusique}>♫</Text>
      </View>

      <Text style={s.titre}>{chant.titre}</Text>
      <Text style={s.auteur}>{chant.auteur || 'Auteur inconnu'}</Text>

      <View style={s.carteLecteur}>
        <Text style={s.titreSection}>LECTEUR AUDIO</Text>

        <TouchableOpacity
          style={s.boutonLecture}
          onPress={basculerLecture}
          accessibilityRole="button"
          accessibilityLabel={statut.playing ? 'Mettre en pause' : 'Lire le chant'}
        >
          <Text style={s.iconeLecture}>
            {statut.playing ? 'Ⅱ' : '▶'}
          </Text>
        </TouchableOpacity>

        <View style={s.piste}>
          <View style={[s.progression, { width: `${progression * 100}%` }]} />
        </View>

        <View style={s.temps}>
          <Text style={s.texteTemps}>{formaterTemps(temps)}</Text>
          <Text style={s.texteTemps}>{formaterTemps(duree)}</Text>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.titreSection}>PAROLES</Text>
        <Text style={s.paroles}>
          {chant.paroles?.trim() || 'Aucune parole enregistrée pour ce chant.'}
        </Text>
      </View>

      <View style={s.section}>
        <Text style={s.titreSection}>PARTITION</Text>
        <Text style={s.texteSecondaire}>
          {chant.partition_uri
            ? 'Une partition est enregistrée pour ce chant.'
            : 'Aucune partition enregistrée pour ce chant.'}
        </Text>
      </View>

      <View style={s.section}>
        <Text style={s.titreSection}>VERSETS BIBLIQUES</Text>

        {chant.versets.length > 0 ? (
          chant.versets.map((verset) => (
            <View key={verset.id} style={s.carteVerset}>
              <Text style={s.reference}>{verset.reference_biblique}</Text>
              <Text style={s.texteVerset}>{verset.texte}</Text>
            </View>
          ))
        ) : (
          <Text style={s.texteSecondaire}>
            Aucun verset biblique enregistré pour ce chant.
          </Text>
        )}
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
  pochette: {
    height: 210,
    borderRadius: 24,
    backgroundColor: C.carte,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3A4D69',
  },
  iconeMusique: {
    color: C.or,
    fontSize: 90,
  },
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
  carteLecteur: {
    backgroundColor: C.carte,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  titreSection: {
    color: C.or,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  boutonLecture: {
    alignSelf: 'center',
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: C.or,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  iconeLecture: {
    color: C.fond,
    fontSize: 26,
    fontWeight: '800',
  },
  piste: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#43536B',
    overflow: 'hidden',
    marginTop: 18,
  },
  progression: {
    height: '100%',
    backgroundColor: C.or,
    borderRadius: 3,
  },
  temps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  texteTemps: {
    color: C.secondaire,
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  paroles: {
    color: C.ivoire,
    fontSize: 16,
    lineHeight: 29,
  },
  texteSecondaire: {
    color: C.secondaire,
    fontSize: 14,
    lineHeight: 23,
  },
  carteVerset: {
    backgroundColor: C.carte,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  reference: {
    color: C.or,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 8,
  },
  texteVerset: {
    color: C.ivoire,
    fontSize: 15,
    lineHeight: 24,
  },
});
