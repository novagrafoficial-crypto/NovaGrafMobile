import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { fontFamily, space, surface, textColors } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Props {
  icono: IconName;
  etiqueta: string;
  valor?: string | null;
  ultima?: boolean;
}

const ESCALA = 1.15;

// Un dato del perfil: ícono a la izquierda, etiqueta pequeña y el valor en negro.
export const FilaDato = ({ icono, etiqueta, valor, ultima }: Props) => (
  <View style={[styles.fila, !ultima && styles.linea]}>
    <View style={styles.icono}>
      <Ionicons name={icono} size={18} color={textColors.primary} />
    </View>
    <View style={styles.textos}>
      <Text style={styles.etiqueta} maxFontSizeMultiplier={ESCALA}>{etiqueta}</Text>
      <Text style={[styles.valor, !valor && styles.vacio]} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>
        {valor || 'Sin agregar'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  linea: { borderBottomWidth: 1, borderBottomColor: surface.muted },
  icono: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: surface.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1 },
  etiqueta: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
  valor: { fontFamily: fontFamily.medium, fontSize: 15, color: textColors.primary },
  vacio: { color: textColors.muted, fontFamily: fontFamily.regular },
});