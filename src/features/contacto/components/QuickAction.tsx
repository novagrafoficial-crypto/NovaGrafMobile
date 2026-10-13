import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';

interface Props {
  icono: string;
  titulo: string;
  onPress: () => void;
  delay?: number;
}

// Botón circular grande (Llamar, WhatsApp, Correo): aparece subiendo y rebota al tocarlo
export const QuickAction = ({ icono, titulo, onPress, delay = 0 }: Props) => (
  <FadeInView delay={delay} distance={26} style={styles.contenedor}>
    <PressableScale onPress={onPress} scaleTo={0.86} style={styles.circulo} accessibilityLabel={titulo}>
      <Text style={styles.icono}>{icono}</Text>
    </PressableScale>
    <Text style={styles.titulo}>{titulo}</Text>
  </FadeInView>
);

const styles = StyleSheet.create({
  contenedor: { alignItems: 'center', gap: 8 },
  circulo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: brandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: brandColors.primaryDark,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  icono: { fontSize: 26 },
  titulo: { fontSize: 12, fontWeight: '700', color: brandTints.accentSoft },
});