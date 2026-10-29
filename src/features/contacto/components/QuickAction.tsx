import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily } from '@/constants/theme';

interface Props {
  /** Nombre de Ionicons */
  icono: string;
  titulo: string;
  onPress: () => void;
  delay?: number;
}

// Botón circular (Llamar, WhatsApp, Correo)
export const QuickAction = ({ icono, titulo, onPress, delay = 0 }: Props) => (
  <FadeInView delay={delay} distance={20} style={styles.contenedor}>
    <PressableScale onPress={onPress} scaleTo={0.88} style={styles.circulo} accessibilityLabel={titulo}>
      <Ionicons name={icono as any} size={26} color={brandColors.primary} />
    </PressableScale>
    <Text style={styles.titulo} maxFontSizeMultiplier={1.15}>{titulo}</Text>
  </FadeInView>
);

const styles = StyleSheet.create({
  contenedor: { alignItems: 'center', gap: 6 },
  circulo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontFamily: fontFamily.medium, fontSize: 13, color: '#FFFFFF' },
});
