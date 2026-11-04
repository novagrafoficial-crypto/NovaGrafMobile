import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { PressableScale } from './PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

interface CustomInputProps extends TextInputProps {
  label: string;
  /** Si es true, oculta el texto y muestra el "ojito" para verlo */
  isPassword?: boolean;
  /** Ícono de Ionicons a la izquierda (ej. "mail-outline") */
  icono?: ComponentProps<typeof Ionicons>['name'];
  /** Mensaje de error debajo del campo (pinta el borde en rojo) */
  error?: string | null;
  /** Texto de ayuda gris debajo del campo (solo si no hay error) */
  ayuda?: string;
  /** Marca el campo como opcional junto a la etiqueta */
  opcional?: boolean;
}

const ESCALA = 1.15;

// Campo de texto de toda la app: etiqueta, ícono, ojito para contraseñas y mensaje de error.
export const CustomInput = ({
  label,
  isPassword,
  icono,
  error,
  ayuda,
  opcional,
  onFocus,
  onBlur,
  multiline,
  ...inputProps
}: CustomInputProps) => {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const colorIcono = error ? brandColors.error : focused ? brandColors.primary : textColors.muted;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.label} maxFontSizeMultiplier={ESCALA}>
        {label}
        {opcional && <Text style={styles.opcional}> (opcional)</Text>}
      </Text>

      <View style={[styles.box, multiline && styles.boxMultilinea, focused && styles.boxFocused, !!error && styles.boxError]}>
        {!!icono && <Ionicons name={icono} size={19} color={colorIcono} style={multiline ? { marginTop: 13 } : undefined} />}
        <TextInput
          {...inputProps}
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.inputMultilinea]}
          placeholderTextColor={textColors.muted}
          secureTextEntry={isPassword ? !visible : inputProps.secureTextEntry}
          maxFontSizeMultiplier={ESCALA}
        />
        {isPassword && (
          <PressableScale
            onPress={() => setVisible((v) => !v)}
            style={styles.ojo}
            hitSlop={10}
            scaleTo={0.85}
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={21} color={textColors.secondary} />
          </PressableScale>
        )}
      </View>

      {error ? (
        <View style={styles.mensaje}>
          <Ionicons name="alert-circle" size={14} color={brandColors.error} />
          <Text style={styles.error} maxFontSizeMultiplier={ESCALA}>{error}</Text>
        </View>
      ) : ayuda ? (
        <Text style={styles.ayuda} maxFontSizeMultiplier={ESCALA}>{ayuda}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { marginBottom: space.lg, gap: 6 },
  label: { fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },
  opcional: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
  box: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    backgroundColor: surface.card,
    borderWidth: 1,
    borderColor: surface.border,
    borderRadius: radius.md,
  },
  boxMultilinea: { alignItems: 'flex-start' },
  boxFocused: { borderColor: brandColors.primary, borderWidth: 1.5 },
  boxError: { borderColor: brandColors.error, borderWidth: 1.5, backgroundColor: '#FFFBFB' },
  input: { flex: 1, minHeight: 48, fontFamily: fontFamily.regular, fontSize: 15, color: textColors.primary, paddingVertical: 0 },
  inputMultilinea: { minHeight: 80, paddingVertical: 12, textAlignVertical: 'top' },
  ojo: { padding: 4 },
  mensaje: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  error: { flex: 1, fontFamily: fontFamily.medium, fontSize: 12, color: brandColors.error },
  ayuda: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
});
