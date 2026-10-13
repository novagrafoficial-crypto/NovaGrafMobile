import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors, brandTints } from '@/constants/brand';

interface Props {
  titulo: string;
  descripcion: string;
  index: number;
}

// Tarjeta de un valor de la empresa
export const ValueCard = ({ titulo, descripcion, index }: Props) => (
  <FadeInView delay={Math.min(index, 6) * 70} style={styles.card}>
    <View style={styles.circulo}>
      <Text style={styles.icono}>✨</Text>
    </View>
    <View style={styles.info}>
      <Text style={styles.titulo}>{titulo}</Text>
      {!!descripcion && <Text style={styles.texto}>{descripcion}</Text>}
    </View>
  </FadeInView>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: brandColors.white,
    borderRadius: 16,
    padding: 14,
  },
  circulo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: brandTints.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icono: { fontSize: 20 },
  info: { flex: 1 },
  titulo: { fontSize: 15, fontWeight: '800', color: brandColors.primaryDark },
  texto: { fontSize: 13, color: brandTints.textMuted, lineHeight: 19, marginTop: 3 },
});