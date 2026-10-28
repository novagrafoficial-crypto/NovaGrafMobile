import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

interface Props {
  titulo: string;
  descripcion: string;
  index: number;
}

// Íconos que se van turnando entre los valores
const ICONOS: ComponentProps<typeof Ionicons>['name'][] = [
  'ribbon-outline',
  'people-outline',
  'bulb-outline',
  'shield-checkmark-outline',
  'heart-outline',
  'star-outline',
];

// Tarjeta de un valor de la empresa
export const ValueCard = ({ titulo, descripcion, index }: Props) => (
  <FadeInView delay={Math.min(index, 6) * 70} style={styles.card}>
    <View style={styles.circulo}>
      <Ionicons name={ICONOS[index % ICONOS.length]} size={20} color={brandColors.primary} />
    </View>
    <View style={styles.info}>
      <Text style={styles.titulo} maxFontSizeMultiplier={1.15}>{titulo}</Text>
      {!!descripcion && <Text style={styles.texto} maxFontSizeMultiplier={1.15}>{descripcion}</Text>}
    </View>
  </FadeInView>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: space.md,
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: surface.border,
  },
  circulo: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  titulo: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  texto: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary, lineHeight: 19, marginTop: 2 },
});
