import React from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { PressableScale } from '@/shared/components/PressableScale';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Props extends Omit<TextInputProps, 'style'> {
  etiqueta: string;
  icono: IconName;
  /** Muestra un candado y bloquea el campo */
  bloqueado?: boolean;
  /** Para contraseñas: muestra el ojo para ver / ocultar */
  onAlternarVer?: () => void;
  visible?: boolean;
}

const ESCALA = 1.15;

// Campo de formulario con ícono, igual en editar perfil y en contraseña.
export const CampoTexto = ({ etiqueta, icono, bloqueado, onAlternarVer, visible, ...input }: Props) => {
  const [enfocado, setEnfocado] = React.useState(false);

  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta} maxFontSizeMultiplier={ESCALA}>{etiqueta}</Text>
      <View style={[styles.caja, enfocado && styles.cajaEnfocada, bloqueado && styles.cajaBloqueada]}>
        <Ionicons name={icono} size={18} color={enfocado ? brandColors.primary : textColors.muted} />
        <TextInput
          {...input}
          editable={!bloqueado}
          style={styles.input}
          placeholderTextColor={textColors.muted}
          maxFontSizeMultiplier={ESCALA}
          onFocus={(e) => { setEnfocado(true); input.onFocus?.(e); }}
          onBlur={(e) => { setEnfocado(false); input.onBlur?.(e); }}
        />
        {bloqueado && <Ionicons name="lock-closed-outline" size={16} color={textColors.muted} />}
        {!!onAlternarVer && (
          <PressableScale onPress={onAlternarVer} hitSlop={10} scaleTo={0.85} accessibilityLabel={visible ? 'Ocultar contraseña' : 'Ver contraseña'}>
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={textColors.secondary} />
          </PressableScale>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { gap: 6 },
  etiqueta: { fontFamily: fontFamily.medium, fontSize: 13, color: textColors.secondary },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 48,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: surface.border,
    backgroundColor: surface.card,
  },
  cajaEnfocada: { borderColor: brandColors.primary, borderWidth: 1.5 },
  cajaBloqueada: { backgroundColor: surface.muted },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: textColors.primary,
    paddingVertical: 0,
  },
});