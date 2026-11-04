import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

interface Props {
  titulo: string;
  icono: React.ComponentProps<typeof Ionicons>['name'];
  /** Texto o contador a la derecha del título */
  derecha?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const ESCALA = 1.15;

// Tarjeta blanca con encabezado (ícono cuadrado + título). Base de todas las pantallas admin.
export const SeccionAdmin = ({ titulo, icono, derecha, children, style }: Props) => (
  <View style={[styles.card, style]}>
    <View style={styles.encabezado}>
      <View style={styles.icono}>
        <Ionicons name={icono} size={17} color={brandColors.primary} />
      </View>
      <Text style={styles.titulo} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{titulo}</Text>
      {typeof derecha === 'string' ? (
        <Text style={styles.derechaTexto} maxFontSizeMultiplier={ESCALA}>{derecha}</Text>
      ) : (
        derecha
      )}
    </View>
    {children}
  </View>
);

/** Fila etiqueta / valor dentro de una sección */
export const FilaAdmin = ({ etiqueta, valor, fuerte, ultima }: { etiqueta: string; valor?: string | null; fuerte?: boolean; ultima?: boolean }) => (
  <View style={[styles.fila, !ultima && styles.linea]}>
    <Text style={styles.filaEtiqueta} maxFontSizeMultiplier={ESCALA}>{etiqueta}</Text>
    <Text style={[styles.filaValor, fuerte && styles.filaFuerte]} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>
      {valor || '—'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
    borderWidth: 1,
    borderColor: surface.border,
  },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  icono: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#E6F2EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { flex: 1, fontFamily: fontFamily.semibold, fontSize: 16, color: textColors.primary },
  derechaTexto: { fontFamily: fontFamily.medium, fontSize: 13, color: textColors.muted },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space.md, paddingVertical: 9 },
  linea: { borderBottomWidth: 1, borderBottomColor: surface.muted },
  filaEtiqueta: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary },
  filaValor: { flexShrink: 1, textAlign: 'right', fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },
  filaFuerte: { fontFamily: fontFamily.bold, fontSize: 16 },
});
