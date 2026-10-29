import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { PressableScale } from '@/shared/components/PressableScale';
import { fontFamily, radius, space, textColors } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Props {
  titulo: string;
  subtitulo?: string;
  /** Ícono opcional a la izquierda del título (ej. 'flame' para ofertas) */
  icono?: IconName;
  /** Color del ícono; el fondo del círculo se pinta con ese mismo color, muy suave */
  colorIcono?: string;
  /** Texto del enlace de la derecha, ej. "Ver todo" */
  accion?: string;
  onAccion?: () => void;
}

// Encabezado único para todas las secciones del inicio: mismo tamaño y color en todas.
export const SeccionTitulo = ({ titulo, subtitulo, icono, colorIcono = textColors.primary, accion, onAccion }: Props) => (
  <View style={styles.contenedor}>
    {!!icono && (
      <View style={[styles.iconoCaja, { backgroundColor: `${colorIcono}1A` }]}>
        <Ionicons name={icono} size={20} color={colorIcono} />
      </View>
    )}

    <View style={{ flex: 1 }}>
      <Text style={styles.titulo} numberOfLines={1} maxFontSizeMultiplier={1.15}>{titulo}</Text>
      {!!subtitulo && (
        <Text style={styles.subtitulo} numberOfLines={1} maxFontSizeMultiplier={1.15}>{subtitulo}</Text>
      )}
    </View>

    {!!accion && !!onAccion && (
      <PressableScale onPress={onAccion} hitSlop={10} scaleTo={0.94} style={styles.accion}>
        <Text style={styles.accionTexto} maxFontSizeMultiplier={1.15}>{accion}</Text>
        <Ionicons name="chevron-forward" size={14} color={textColors.primary} />
      </PressableScale>
    )}
  </View>
);

const styles = StyleSheet.create({
  contenedor: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md },
  iconoCaja: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary, letterSpacing: -0.2 },
  subtitulo: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary, marginTop: 1 },
  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  accionTexto: { fontFamily: fontFamily.medium, fontSize: 12, color: textColors.primary },
});