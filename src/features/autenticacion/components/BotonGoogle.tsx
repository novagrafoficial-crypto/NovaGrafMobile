import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '@/shared/components/CustomButton';
import { fontFamily, space, surface, textColors } from '@/constants/theme';

interface Props {
  /** Texto del separador, p. ej. "o continúa con" o "o regístrate con". */
  separador: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/** Separador + botón "Continuar con Google", compartido por Login y Registro. */
export const BotonGoogle = ({ separador, onPress, loading, disabled }: Props) => (
  <>
    <View style={styles.separador}>
      <View style={styles.linea} />
      <Text style={styles.o} maxFontSizeMultiplier={1.15}>{separador}</Text>
      <View style={styles.linea} />
    </View>

    <CustomButton
      title="Continuar con Google"
      variant="outline"
      icon={<Ionicons name="logo-google" size={19} color="#EA4335" />}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
    />
  </>
);

const styles = StyleSheet.create({
  separador: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.lg },
  linea: { flex: 1, height: 1, backgroundColor: surface.border },
  o: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.muted },
});