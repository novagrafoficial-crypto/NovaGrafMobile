import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

interface Props {
  /** Nombre de Ionicons */
  icono: string;
  titulo: string;
  delay?: number;
  children: React.ReactNode;
}

// Tarjeta blanca con encabezado (ícono + título) y contenido adentro
export const InfoCard = ({ icono, titulo, delay = 0, children }: Props) => (
  <FadeInView delay={delay} style={styles.card}>
    <View style={styles.encabezado}>
      <View style={styles.circulo}>
        <Ionicons name={icono as any} size={17} color={brandColors.primary} />
      </View>
      <Text style={styles.titulo} maxFontSizeMultiplier={1.15}>{titulo}</Text>
    </View>
    {children}
  </FadeInView>
);

const styles = StyleSheet.create({
  card: { backgroundColor: surface.card, borderRadius: radius.lg, padding: space.lg, borderWidth: 1, borderColor: surface.border },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.xs },
  circulo: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: fontFamily.semibold, fontSize: 16, color: textColors.primary },
});
