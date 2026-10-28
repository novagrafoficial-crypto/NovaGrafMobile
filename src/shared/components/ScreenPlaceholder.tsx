import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FadeInView } from './FadeInView';
import { brandColors, brandTints } from '@/constants/brand';

export const ScreenPlaceholder = ({ titulo }: { titulo: string }) => (
  <View style={styles.contenedor}>
    <FadeInView style={styles.centro}>
      <View style={styles.circulo}>
        <Text style={styles.icono}>🚧</Text>
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.subtitulo}>Próximamente...</Text>
    </FadeInView>
  </View>
);

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brandColors.background,
  },
  centro: { alignItems: 'center' },
  circulo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: brandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icono: { fontSize: 36 },
  titulo: { fontSize: 24, fontWeight: '700', color: brandColors.primaryDark },
  subtitulo: { fontSize: 16, color: brandTints.textMuted, marginTop: 8 },
});
