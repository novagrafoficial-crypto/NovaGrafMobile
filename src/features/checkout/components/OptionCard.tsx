import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';

interface Props {
  titulo: string;
  descripcion?: string | null;
  /** Texto a la derecha: costo ("Gratis", "$35.00") o una nota. */
  derecha?: string;
  seleccionada: boolean;
  onPress: () => void;
}

export const OptionCard = ({ titulo, descripcion, derecha, seleccionada, onPress }: Props) => (
  <PressableScale
    onPress={onPress}
    scaleTo={0.98}
    style={[styles.card, seleccionada && styles.cardActiva]}
    accessibilityRole="radio"
    accessibilityState={{ selected: seleccionada }}
  >
    <View style={[styles.radio, seleccionada && styles.radioActivo]}>
      {seleccionada && <View style={styles.radioPunto} />}
    </View>
    <View style={styles.info}>
      <Text style={styles.titulo}>{titulo}</Text>
      {!!descripcion && <Text style={styles.descripcion}>{descripcion}</Text>}
    </View>
    {!!derecha && <Text style={[styles.derecha, seleccionada && styles.derechaActiva]}>{derecha}</Text>}
  </PressableScale>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: brandColors.white, borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  cardActiva: { borderColor: brandColors.accent, backgroundColor: brandTints.accentSoft },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: brandTints.border, alignItems: 'center', justifyContent: 'center',
  },
  radioActivo: { borderColor: brandColors.primary },
  radioPunto: { width: 10, height: 10, borderRadius: 5, backgroundColor: brandColors.primary },
  info: { flex: 1 },
  titulo: { fontSize: 14, fontWeight: '800', color: brandColors.primaryDark },
  descripcion: { fontSize: 12, color: brandTints.textMuted, marginTop: 2 },
  derecha: { fontSize: 13, fontWeight: '700', color: brandTints.textMuted },
  derechaActiva: { color: brandColors.primary },
});