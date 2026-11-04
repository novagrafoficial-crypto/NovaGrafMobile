import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '@/shared/components/CustomButton';
import { brandColors } from '@/constants/brand';

interface Props {
  generando: boolean;
  error: string | null;
  info: string | null;
  onPdf: () => void;
}

export const AccionesFicha = ({ generando, error, info, onPdf }: Props) => (
  <View style={styles.caja}>
    <CustomButton
      title={generando ? 'Generando PDF...' : 'Descargar ficha (PDF)'}
      icon={<Ionicons name="download-outline" size={20} color={brandColors.white} />}
      onPress={onPdf}
      disabled={generando}
    />
    {!!info && <Text style={styles.info}>{info}</Text>}
    {!!error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  caja: { gap: 8 },
  info: { color: brandColors.primary, textAlign: 'center', fontSize: 12, fontWeight: '600' },
  error: { color: brandColors.error, textAlign: 'center', fontSize: 12, fontWeight: '600' },
});