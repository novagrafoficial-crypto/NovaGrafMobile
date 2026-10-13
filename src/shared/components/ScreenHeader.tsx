import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from './PressableScale';
import { brandColors } from '@/constants/brand';

interface ScreenHeaderProps {
  title: string;
  /** Si se pasa, aparece la flecha de regreso. */
  onBack?: () => void;
}

// Encabezado de marca para pantallas internas. Respeta la barra de estado
// (safe area), así el contenido nunca queda "pegado" arriba.
export const ScreenHeader = ({ title, onBack }: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      {onBack ? (
        <PressableScale onPress={onBack} hitSlop={12} style={styles.side} accessibilityLabel="Regresar">
          <Text style={styles.back}>←</Text>
        </PressableScale>
      ) : (
        <View style={styles.side} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: brandColors.primaryDark,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  back: { color: brandColors.white, fontSize: 26, fontWeight: '600', lineHeight: 28 },
  title: { flex: 1, textAlign: 'center', color: brandColors.white, fontSize: 17, fontWeight: '700' },
});
