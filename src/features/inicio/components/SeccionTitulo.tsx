import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { fontFamily, space, textColors } from '@/constants/theme';

interface Props {
  titulo: string;
  subtitulo?: string;
  /** Texto del enlace de la derecha, ej. "Ver todo" */
  accion?: string;
  onAccion?: () => void;
}

// Encabezado único para todas las secciones del inicio: mismo tamaño y color en todas.
export const SeccionTitulo = ({ titulo, subtitulo, accion, onAccion }: Props) => (
  <View style={styles.contenedor}>
    <View style={styles.fila}>
      <Text style={styles.titulo} numberOfLines={1} maxFontSizeMultiplier={1.15}>{titulo}</Text>
      {!!accion && !!onAccion && (
        <PressableScale onPress={onAccion} hitSlop={10} scaleTo={0.94} style={styles.accion}>
          <Text style={styles.accionTexto} maxFontSizeMultiplier={1.15}>{accion}</Text>
          <Ionicons name="chevron-forward" size={14} color={textColors.primary} />
        </PressableScale>
      )}
    </View>
    {!!subtitulo && <Text style={styles.subtitulo} maxFontSizeMultiplier={1.15}>{subtitulo}</Text>}
  </View>
);

const styles = StyleSheet.create({
  contenedor: { gap: 2, marginBottom: space.md },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  titulo: { flex: 1, fontFamily: fontFamily.semibold, fontSize: 17, color: textColors.primary },
  subtitulo: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
  accion: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  accionTexto: { fontFamily: fontFamily.medium, fontSize: 13, color: textColors.primary },
});