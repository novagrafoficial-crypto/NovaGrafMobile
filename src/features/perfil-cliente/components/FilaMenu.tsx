import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { brandColors } from '@/constants/brand';
import { fontFamily, space, surface, textColors } from '@/constants/theme';
import { PressableScale } from '@/shared/components/PressableScale';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Props {
  icono: IconName;
  titulo: string;
  onPress: () => void;
  contador?: number;
  /** Flecha hacia la derecha (por defecto) o arriba/abajo si abre algo */
  flecha?: 'derecha' | 'abajo' | 'arriba' | 'ninguna';
  peligro?: boolean;
  ultima?: boolean;
}

const ESCALA = 1.15;

// Opción tocable tipo menú (Notificaciones, Mis pedidos, Cambiar contraseña, Cerrar sesión).
export const FilaMenu = ({ icono, titulo, onPress, contador, flecha = 'derecha', peligro, ultima }: Props) => {
  const color = peligro ? brandColors.error : textColors.primary;
  const nombreFlecha = flecha === 'abajo' ? 'chevron-down' : flecha === 'arriba' ? 'chevron-up' : 'chevron-forward';

  return (
    <PressableScale style={[styles.fila, !ultima && styles.linea]} onPress={onPress} scaleTo={0.98}>
      <View style={[styles.icono, peligro && styles.iconoPeligro]}>
        <Ionicons name={icono} size={19} color={color} />
      </View>
      <Text style={[styles.titulo, { color }]} maxFontSizeMultiplier={ESCALA}>{titulo}</Text>
      {!!contador && (
        <View style={styles.contador}>
          <Text style={styles.contadorTexto} maxFontSizeMultiplier={1}>{contador > 99 ? '99+' : contador}</Text>
        </View>
      )}
      {flecha !== 'ninguna' && <Ionicons name={nombreFlecha} size={18} color={textColors.muted} />}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  linea: { borderBottomWidth: 1, borderBottomColor: surface.muted },
  icono: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: surface.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoPeligro: { backgroundColor: '#FEE2E2' },
  titulo: { flex: 1, fontFamily: fontFamily.medium, fontSize: 15 },
  contador: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: brandColors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorTexto: { fontFamily: fontFamily.semibold, fontSize: 11, color: '#FFFFFF' },
});