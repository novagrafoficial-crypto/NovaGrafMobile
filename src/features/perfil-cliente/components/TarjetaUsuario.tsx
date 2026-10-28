import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { getInitials } from '@/shared/utils/getInitials';

interface Props {
  nombre?: string;
  apellido?: string;
  correo?: string;
  esGoogle: boolean;
}

const ESCALA = 1.15;

// Tarjeta de arriba: iniciales, nombre, correo y tipo de cuenta.
export const TarjetaUsuario = ({ nombre, apellido, correo, esGoogle }: Props) => (
  <View style={styles.card}>
    <View style={styles.avatar}>
      <Text style={styles.iniciales} maxFontSizeMultiplier={1}>{getInitials(nombre, apellido)}</Text>
    </View>

    <View style={styles.info}>
      <Text style={styles.nombre} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>
        {[nombre, apellido].filter(Boolean).join(' ')}
      </Text>
      <Text style={styles.correo} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{correo}</Text>

      <View style={styles.cuenta}>
        <Ionicons name={esGoogle ? 'logo-google' : 'mail-outline'} size={13} color={textColors.secondary} />
        <Text style={styles.cuentaTexto} maxFontSizeMultiplier={ESCALA}>
          {esGoogle ? 'Cuenta de Google' : 'Cuenta con correo'}
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: surface.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: brandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciales: { fontFamily: fontFamily.bold, fontSize: 22, color: '#FFFFFF' },
  info: { flex: 1, gap: 2 },
  nombre: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  correo: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary },
  cuenta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: surface.muted,
  },
  cuentaTexto: { fontFamily: fontFamily.medium, fontSize: 12, color: textColors.secondary },
});