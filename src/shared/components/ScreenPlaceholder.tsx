import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { brandColors } from '@/constants/brand';

// Pantalla temporal "Próximamente..." hasta que exista el módulo real.
export const ScreenPlaceholder = ({ titulo }: { titulo: string }) => (
  <View style={styles.contenedor}>
    <Text style={styles.titulo}>{titulo}</Text>
    <Text style={styles.subtitulo}>Próximamente...</Text>
  </View>
);

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brandColors.background,
  },
  titulo: { fontSize: 24, fontWeight: '700', color: brandColors.primaryDark },
  subtitulo: { fontSize: 16, color: '#666', marginTop: 8 },
});
