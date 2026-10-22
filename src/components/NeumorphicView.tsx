
import React from 'react';
import {
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { couleurs } from '../theme';

interface Props {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  distance?: number;
  enfonce?: boolean;
}

export default function NeumorphicView({
  children,
  style,
  borderRadius = 20,
  distance = 5,
  enfonce = false,
}: Props) {
  const couleurOmbre = enfonce
    ? `${couleurs.ombreFonce}55`
    : `${couleurs.ombreFonce}99`;

  return (
    <Shadow
      distance={distance}
      startColor={couleurOmbre}
      offset={[distance, distance]}
      style={{ borderRadius }}
    >
      <Shadow
        distance={distance}
        startColor={`${couleurs.ombreClair}cc`}
        offset={[-distance, -distance]}
        style={{ borderRadius }}
      >
        <View
          style={[
            {
              backgroundColor: couleurs.fond,
              borderRadius,
            },
            style,
          ]}
        >
          {children}
        </View>
      </Shadow>
    </Shadow>
  );
}
