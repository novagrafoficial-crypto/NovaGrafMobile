import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors, brandTints } from '@/constants/brand';

interface Props {
  icono: string;
  titulo: string;
  delay?: number;
  children: React.ReactNode;
}

// Tarjeta blanca con encabezado (icono + título) y contenido adentro
export const InfoCard = ({ icono, titulo, delay = 0, children }: Props) => (
  <FadeInView delay={delay} style={styles.card}>
    <View style={styles.encabezado}>
      <View style={styles.circulo}>
        <Text style={styles.icono}>{icono}</Text>
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
    </View>
    {children}
  </FadeInView>
);

const styles = StyleSheet.create({
  card: { backgroundColor: brandColors.white, borderRadius: 20, padding: 16 },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  circulo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: brandTints.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icono: { fontSize: 18 },
  titulo: { fontSize: 17, fontWeight: '800', color: brandColors.primaryDark },
});