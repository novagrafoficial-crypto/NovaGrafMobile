import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';

interface Props {
  icono: string;
  nombre: string;
  onPress: () => void;
}

// Pastilla de una red social
export const SocialChip = ({ icono, nombre, onPress }: Props) => (
  <PressableScale style={styles.chip} onPress={onPress} scaleTo={0.92} accessibilityLabel={`Abrir ${nombre}`}>
    <Text style={styles.icono}>{icono}</Text>
    <Text style={styles.nombre}>{nombre}</Text>
  </PressableScale>
);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: brandTints.accentSoft,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  icono: { fontSize: 18 },
  nombre: { fontSize: 14, fontWeight: '700', color: brandColors.primary },
});