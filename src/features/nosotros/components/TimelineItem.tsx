import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors, brandTints } from '@/constants/brand';

interface Props {
  fechaTexto: string;
  descripcion: string;
  index: number;
  esUltimo: boolean;
}

// Un hito de la línea de tiempo: punto + línea vertical + tarjeta
export const TimelineItem = ({ fechaTexto, descripcion, index, esUltimo }: Props) => (
  <FadeInView delay={Math.min(index, 6) * 80} style={styles.fila}>
    <View style={styles.riel}>
      <View style={styles.punto} />
      {!esUltimo && <View style={styles.linea} />}
    </View>

    <View style={[styles.card, esUltimo && styles.cardUltima]}>
      {!!fechaTexto && (
        <View style={styles.pildora}>
          <Text style={styles.fecha}>{fechaTexto}</Text>
        </View>
      )}
      <Text style={styles.descripcion}>{descripcion}</Text>
    </View>
  </FadeInView>
);

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', gap: 12 },
  riel: { width: 18, alignItems: 'center' },
  punto: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: brandColors.accent,
    borderWidth: 3,
    borderColor: brandTints.accentSoft,
    marginTop: 16,
  },
  linea: { flex: 1, width: 2, backgroundColor: brandTints.border, marginTop: 4 },
  card: {
    flex: 1,
    backgroundColor: brandColors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  cardUltima: { marginBottom: 0 },
  pildora: {
    alignSelf: 'flex-start',
    backgroundColor: brandTints.accentSoft,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  fecha: { fontSize: 12, fontWeight: '800', color: brandColors.primary },
  descripcion: { fontSize: 14, color: brandColors.primaryDark, lineHeight: 20 },
});