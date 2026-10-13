import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors, brandTints } from '@/constants/brand';

interface Props {
  icono: string;
  titulo: string;
  texto?: string | null;
  /** Color de la franja izquierda (distingue misión de visión) */
  acento: string;
  delay?: number;
}

// Tarjeta de Misión o Visión
export const PurposeCard = ({ icono, titulo, texto, acento, delay = 0 }: Props) => (
  <FadeInView delay={delay} style={[styles.card, { borderLeftColor: acento }]}>
    <View style={styles.encabezado}>
      <View style={styles.circulo}>
        <Text style={styles.icono}>{icono}</Text>
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
    </View>
    <Text style={styles.texto}>{texto || 'Sin información registrada.'}</Text>
  </FadeInView>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: brandColors.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 5,
  },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  circulo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brandTints.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icono: { fontSize: 20 },
  titulo: { fontSize: 18, fontWeight: '800', color: brandColors.primaryDark },
  texto: { fontSize: 14, color: brandTints.textMuted, lineHeight: 21 },
});