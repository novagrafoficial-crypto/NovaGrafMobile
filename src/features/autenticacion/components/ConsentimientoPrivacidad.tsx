import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, space, textColors } from '@/constants/theme';

interface Props {
  aceptado: boolean;
  onAlternar: () => void;
  onVerAviso: () => void;
}

// Consentimiento explícito (opt-in): la casilla inicia SIN marcar.
export const ConsentimientoPrivacidad = ({ aceptado, onAlternar, onVerAviso }: Props) => (
  <View style={styles.fila}>
    <PressableScale
      onPress={onAlternar}
      scaleTo={0.9}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: aceptado }}
      accessibilityLabel="Acepto el Aviso de Privacidad"
      style={[styles.casilla, aceptado && styles.casillaMarcada]}
    >
      {aceptado && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
    </PressableScale>
    <Text style={styles.texto} maxFontSizeMultiplier={1.15}>
      He leído y acepto el{' '}
      <Text style={styles.enlace} onPress={onVerAviso} accessibilityRole="link">
        Aviso de Privacidad y las Políticas de Nova Graf
      </Text>
      , y autorizo el tratamiento de mis datos personales.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginBottom: space.lg },
  casilla: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: textColors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  casillaMarcada: { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
  texto: { flex: 1, fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 19, color: textColors.primary },
  enlace: { fontFamily: fontFamily.semibold, color: brandColors.primary, textDecorationLine: 'underline' },
});
