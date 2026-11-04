import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { FadeInView } from '@/shared/components/FadeInView';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

interface Props {
  icono: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  texto?: string | null;
  /** Color del ícono y de la franja izquierda (distingue misión de visión) */
  acento: string;
  delay?: number;
}

// Tarjeta de Misión o Visión
export const PurposeCard = ({ icono, titulo, texto, acento, delay = 0 }: Props) => (
  <FadeInView delay={delay} style={[styles.card, { borderLeftColor: acento }]}>
    <View style={styles.encabezado}>
      <View style={[styles.circulo, { backgroundColor: `${acento}1F` }]}>
        <Ionicons name={icono} size={20} color={acento} />
      </View>
      <Text style={styles.titulo} maxFontSizeMultiplier={1.15}>{titulo}</Text>
    </View>
    <Text style={styles.texto} maxFontSizeMultiplier={1.15}>{texto || 'Sin información registrada.'}</Text>
  </FadeInView>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.lg,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: surface.border,
  },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  circulo: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: fontFamily.bold, fontSize: 17, color: textColors.primary },
  texto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, lineHeight: 21 },
});
