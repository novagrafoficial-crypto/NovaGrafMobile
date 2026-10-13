import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { brandColors, brandTints } from '@/constants/brand';

interface Props {
  etiqueta: string;
  titulo: string;
  subtitulo?: string;
}

// Encabezado de cada sección: etiqueta pequeña + título + texto de apoyo
export const SectionHeading = ({ etiqueta, titulo, subtitulo }: Props) => (
  <View style={styles.contenedor}>
    <Text style={styles.etiqueta}>{etiqueta.toUpperCase()}</Text>
    <Text style={styles.titulo}>{titulo}</Text>
    {!!subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
  </View>
);

const styles = StyleSheet.create({
  contenedor: { marginBottom: 14 },
  etiqueta: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: brandColors.primary },
  titulo: { fontSize: 22, fontWeight: '800', color: brandColors.primaryDark, marginTop: 2 },
  subtitulo: { fontSize: 14, color: brandTints.textMuted, marginTop: 4, lineHeight: 20 },
});