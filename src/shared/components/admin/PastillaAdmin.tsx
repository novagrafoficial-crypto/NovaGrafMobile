import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily, radius } from '@/constants/theme';

interface Props {
  texto: string;
  bg: string;
  fg: string;
  icono?: React.ComponentProps<typeof Ionicons>['name'];
}

// Pastilla de estado (pedido, pago, previa, cliente…)
export const PastillaAdmin = ({ texto, bg, fg, icono }: Props) => (
  <View style={[styles.pastilla, { backgroundColor: bg }]}>
    {!!icono && <Ionicons name={icono} size={13} color={fg} />}
    <Text style={[styles.texto, { color: fg }]} numberOfLines={1} maxFontSizeMultiplier={1.1}>{texto}</Text>
  </View>
);

const styles = StyleSheet.create({
  pastilla: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  texto: { fontFamily: fontFamily.semibold, fontSize: 12 },
});
