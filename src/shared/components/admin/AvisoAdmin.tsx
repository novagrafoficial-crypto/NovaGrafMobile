import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInView } from '../FadeInView';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, textColors } from '@/constants/theme';

// Mensaje de resultado (guardado / error) arriba del contenido.
export const AvisoAdmin = ({ texto, ok }: { texto: string; ok: boolean }) => (
  <FadeInView distance={-10} duration={250} style={[styles.aviso, ok ? styles.ok : styles.error]}>
    <Ionicons name={ok ? 'checkmark-circle' : 'alert-circle'} size={20} color={ok ? '#166534' : brandColors.error} />
    <Text style={styles.texto} maxFontSizeMultiplier={1.15}>{texto}</Text>
  </FadeInView>
);

const styles = StyleSheet.create({
  aviso: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.md },
  ok: { backgroundColor: '#DCFCE7' },
  error: { backgroundColor: '#FEE2E2' },
  texto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },
});
