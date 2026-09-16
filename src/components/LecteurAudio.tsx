import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

interface Props {
  uriAudio: string;
  titre: string;
}

function formaterTemps(secondes: number): string {
  const min = Math.floor(secondes / 60);
  const sec = Math.floor(secondes % 60);
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export default function LecteurAudio({ uriAudio, titre }: Props) {
  const player = useAudioPlayer(uriAudio);
  const status = useAudioPlayerStatus(player);

  const [volume, setVolume] = useState(1);

  useEffect(() => {
    player.volume = volume;
  }, [volume]);

  function togglePlayPause() {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  const duree = status.duration ?? 0;
  const position = status.currentTime ?? 0;

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>🎵 {titre}</Text>

      <View style={styles.ligneControle}>
        <TouchableOpacity onPress={togglePlayPause} style={styles.boutonPlay}>
          <Text style={styles.iconePlay}>{status.playing ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <View style={styles.progressionConteneur}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duree > 0 ? duree : 1}
            value={position}
            onSlidingComplete={(valeur) => player.seekTo(valeur)}
            minimumTrackTintColor="#2563eb"
            maximumTrackTintColor="#ccc"
          />
          <View style={styles.tempsLigne}>
            <Text style={styles.temps}>{formaterTemps(position)}</Text>
            <Text style={styles.temps}>{formaterTemps(duree)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.volumeLigne}>
        <Text style={styles.volumeIcone}>🔊</Text>
        <Slider
          style={styles.sliderVolume}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={setVolume}
          minimumTrackTintColor="#2563eb"
          maximumTrackTintColor="#ccc"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  titre: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  ligneControle: { flexDirection: 'row', alignItems: 'center' },
  boutonPlay: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconePlay: { color: '#fff', fontSize: 18 },
  progressionConteneur: { flex: 1 },
  slider: { width: '100%', height: 30 },
  tempsLigne: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -6 },
  temps: { fontSize: 11, color: '#666' },
  volumeLigne: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  volumeIcone: { marginRight: 8 },
  sliderVolume: { flex: 1, height: 30 },
});