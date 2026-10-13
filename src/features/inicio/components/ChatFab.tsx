import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FadeInView } from '@/shared/components/FadeInView';
import { PulseView } from '@/shared/components/PulseView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';

interface Props {
  onPress: () => void;
}

// Botón flotante del chat (abajo a la derecha). El aro verde "respira" para llamar la atención.
export const ChatFab = ({ onPress }: Props) => (
  <FadeInView delay={600} style={styles.contenedor}>
    <View style={styles.globo}>
      <Text style={styles.globoTexto}>¿Dudas de tu diseño? Escríbenos</Text>
    </View>

    <View style={styles.boton}>
      <PulseView style={styles.aro} scaleTo={1.35} duration={1400} />
      <PressableScale style={styles.circulo} onPress={onPress} scaleTo={0.9} accessibilityLabel="Abrir chat">
        <Text style={styles.icono}>💬</Text>
      </PressableScale>
    </View>
  </FadeInView>
);

const styles = StyleSheet.create({
  contenedor: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  globo: {
    backgroundColor: brandColors.white,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: brandColors.primaryDark,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  globoTexto: { fontSize: 12, fontWeight: '700', color: brandColors.primaryDark },
  boton: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  aro: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: brandColors.accent,
    opacity: 0.35,
  },
  circulo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: brandColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: brandColors.primaryDark,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  icono: { fontSize: 24 },
});