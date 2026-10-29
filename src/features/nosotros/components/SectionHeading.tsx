import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { brandColors } from '@/constants/brand';
import { fontFamily, textColors } from '@/constants/theme';

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
  etiqueta: { fontFamily: fontFamily.semibold, fontSize: 11, letterSpacing: 1.2, color: brandColors.primary },
  titulo: { fontFamily: fontFamily.bold, fontSize: 20, color: textColors.primary, marginTop: 2 },
  subtitulo: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, marginTop: 4, lineHeight: 20 },
});