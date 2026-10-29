import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { fontFamily, radius, surface, textColors } from '@/constants/theme';

interface Props {
  /** Nombre de Ionicons */
  icono: string;
  nombre: string;
  onPress: () => void;
}

// Pastilla de una red social
export const SocialChip = ({ icono, nombre, onPress }: Props) => (
  <PressableScale style={styles.chip} onPress={onPress} scaleTo={0.94} accessibilityLabel={`Abrir ${nombre}`}>
    <Ionicons name={icono as any} size={18} color={textColors.primary} />
    <Text style={styles.nombre} maxFontSizeMultiplier={1.15}>{nombre}</Text>
  </PressableScale>
);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: surface.border,
    backgroundColor: surface.card,
  },
  nombre: { fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },
});
