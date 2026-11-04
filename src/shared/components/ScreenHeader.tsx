import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from './PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  /** Si se pasa, aparece la flecha de regreso. */
  onBack?: () => void;
  /** Color de fondo. Por defecto el mismo verde que el header del Inicio. */
  color?: string;
}

// Encabezado de marca para pantallas internas. Respeta la barra de estado
// (safe area), así el contenido nunca queda "pegado" arriba.
export const ScreenHeader = ({ title, onBack, color = brandColors.primary }: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: color }]}>
      {onBack ? (
        <PressableScale onPress={onBack} hitSlop={10} style={styles.side} accessibilityLabel="Regresar">
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </PressableScale>
      ) : (
        <View style={styles.hueco} />
      )}
      <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={1.15}>
        {title}
      </Text>
      <View style={styles.hueco} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Círculo translúcido detrás de la flecha: se ve como botón y es fácil de tocar
  side: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  // Espacio vacío del mismo ancho, para que el título quede centrado
  hueco: { width: 36, height: 36 },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    marginHorizontal: 8,
  },
});