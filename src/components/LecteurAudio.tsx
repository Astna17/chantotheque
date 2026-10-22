import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';

import { couleurs, espacements, rayons } from '../theme';

interface Props {
  uriAudio: string;
  titre: string;
  imageUri?: string | null;
}

function formaterTemps(secondes: number): string {
  if (!Number.isFinite(secondes) || secondes < 0) {
    return '00:00';
  }

  const minutes = Math.floor(secondes / 60);
  const secondesRestantes = Math.floor(secondes % 60);

  return (
    `${String(minutes).padStart(2, '0')}:` +
    `${String(secondesRestantes).padStart(2, '0')}`
  );
}

export default function LecteurAudio({
  uriAudio,
}: Props) {
  const player = useAudioPlayer(uriAudio);
  const status = useAudioPlayerStatus(player);

  const [volume, setVolume] = useState(1);
  const [positionTemporaire, setPositionTemporaire] =
    useState<number | null>(null);

  useEffect(() => {
    player.volume = volume;
  }, [player, volume]);

  const duree =
    Number.isFinite(status.duration) && status.duration > 0
      ? status.duration
      : 0;

  const position =
    Number.isFinite(status.currentTime)
      ? Math.max(0, status.currentTime)
      : 0;

  const positionAffichee = positionTemporaire ?? position;

  function changerPosition(valeur: number) {
    if (!Number.isFinite(valeur) || duree <= 0) {
      return;
    }

    const nouvellePosition = Math.max(
      0,
      Math.min(valeur, duree),
    );

    player.seekTo(nouvellePosition);
    setPositionTemporaire(null);
  }

  function basculerLecture() {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  return (
    <View style={styles.conteneur}>
      {/* Barre de progression */}
      <Slider
        style={styles.progression}
        minimumValue={0}
        maximumValue={duree > 0 ? duree : 1}
        value={Math.min(positionAffichee, duree || 1)}
        disabled={duree <= 0}
        onValueChange={setPositionTemporaire}
        onSlidingComplete={changerPosition}
        minimumTrackTintColor={couleurs.accent}
        maximumTrackTintColor="#D8DCE5"
        thumbTintColor={couleurs.accent}
        accessibilityLabel="Position dans le chant"
      />

      <View style={styles.ligneTemps}>
        <Text style={styles.temps}>
          {formaterTemps(positionAffichee)}
        </Text>

        <Text style={styles.temps}>
          {duree > 0 ? formaterTemps(duree) : '--:--'}
        </Text>
      </View>

      {/* Commandes audio */}
      <View style={styles.commandes}>
        <TouchableOpacity
          style={styles.boutonSecondaire}
          onPress={() => changerPosition(position - 10)}
          disabled={duree <= 0}
          accessibilityRole="button"
          accessibilityLabel="Reculer de 10 secondes"
        >
          <Text style={styles.iconeSecondaire}>↶10</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonLecture}
          onPress={basculerLecture}
          accessibilityRole="button"
          accessibilityLabel={
            status.playing ? 'Mettre en pause' : 'Lire le chant'
          }
        >
          <Text style={styles.iconeLecture}>
            {status.playing ? 'Ⅱ' : '▶'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonSecondaire}
          onPress={() => changerPosition(position + 10)}
          disabled={duree <= 0}
          accessibilityRole="button"
          accessibilityLabel="Avancer de 10 secondes"
        >
          <Text style={styles.iconeSecondaire}>10↷</Text>
        </TouchableOpacity>
      </View>

      {/* Volume */}
      <View style={styles.ligneVolume}>
        <Text style={styles.iconeVolume}>
          {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
        </Text>

        <Slider
          style={styles.sliderVolume}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={setVolume}
          minimumTrackTintColor={couleurs.accent}
          maximumTrackTintColor="#D8DCE5"
          thumbTintColor={couleurs.accent}
          accessibilityLabel="Volume du chant"
        />

        <Text style={styles.valeurVolume}>
          {Math.round(volume * 100)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    width: '100%',
    paddingHorizontal: espacements.sm,
    paddingVertical: espacements.sm,
    backgroundColor: couleurs.fond,
    borderRadius: rayons.moyen,
  },

  progression: {
    width: '100%',
    height: 36,
  },

  ligneTemps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: espacements.xs,
  },

  temps: {
    color: couleurs.texteSecondaire,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },

  commandes: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: espacements.xl,
    marginTop: espacements.md,
    marginBottom: espacements.md,
  },

  boutonLecture: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: couleurs.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  iconeLecture: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
  },

  boutonSecondaire: {
    minWidth: 46,
    minHeight: 46,
    borderRadius: rayons.cercle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: couleurs.fondCarte,
  },

  iconeSecondaire: {
    color: couleurs.texte,
    fontSize: 13,
    fontWeight: '700',
  },

  ligneVolume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacements.sm,
    marginTop: espacements.xs,
  },

  iconeVolume: {
    fontSize: 17,
  },

  sliderVolume: {
    flex: 1,
    height: 32,
  },

  valeurVolume: {
    width: 36,
    textAlign: 'right',
    color: couleurs.texteSecondaire,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
});