import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { PressableScale } from './PressableScale';
import { brandColors, brandTints } from '@/constants/brand';

interface CustomInputProps extends TextInputProps {
  label: string;
  /** Si es true, oculta el texto y muestra el "ojito" para verlo */
  isPassword?: boolean;
}

export const CustomInput = ({ label, isPassword, onFocus, onBlur, ...inputProps }: CustomInputProps) => {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  const focusHandlers = {
    onFocus: (e: any) => {
      setFocused(true);
      onFocus?.(e);
    },
    onBlur: (e: any) => {
      setFocused(false);
      onBlur?.(e);
    },
  };

  // El borde se ilumina con el color de marca mientras escribes.
  const boxStyle = [styles.box, focused && styles.boxFocused];

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={boxStyle}>
        <TextInput
          {...inputProps}
          {...focusHandlers}
          style={styles.input}
          placeholderTextColor={brandTints.textMuted}
          secureTextEntry={isPassword ? !visible : inputProps.secureTextEntry}
        />
        {isPassword && (
          <PressableScale
            onPress={() => setVisible(!visible)}
            style={styles.eyeButton}
            hitSlop={10}
            scaleTo={0.85}
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Text style={styles.eyeIcon}>{visible ? '🙈' : '👁️'}</Text>
          </PressableScale>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 13, color: brandTints.textMuted, marginBottom: 6, fontWeight: '600' },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brandTints.surfaceMuted,
    borderWidth: 1.5,
    borderColor: brandTints.border,
    borderRadius: 10,
    marginBottom: 16,
  },
  boxFocused: { borderColor: brandColors.accent, backgroundColor: brandColors.white },
  input: { flex: 1, padding: 14, fontSize: 15, color: brandColors.primaryDark },
  eyeButton: { paddingHorizontal: 14, paddingVertical: 14 },
  eyeIcon: { fontSize: 18 },
});
