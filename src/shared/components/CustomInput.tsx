import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity, StyleSheet } from 'react-native';
import { brandColors } from '@/constants/brand';

interface CustomInputProps extends TextInputProps {
  label: string;
  /** Si es true, oculta el texto y muestra el "ojito" para verlo */
  isPassword?: boolean;
}

export const CustomInput = ({ label, isPassword, ...inputProps }: CustomInputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      {isPassword ? (
        <View style={styles.passwordContainer}>
          <TextInput
            {...inputProps}
            style={styles.passwordInput}
            placeholderTextColor="#999"
            secureTextEntry={!visible}
          />
          <TouchableOpacity
            onPress={() => setVisible(!visible)}
            style={styles.eyeButton}
            hitSlop={10}
          >
            <Text style={styles.eyeIcon}>{visible ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TextInput {...inputProps} style={styles.input} placeholderTextColor="#999" />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 13, color: '#555', marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 15,
    color: brandColors.primary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 16,
  },
  passwordInput: { flex: 1, padding: 14, fontSize: 15, color: brandColors.primary },
  eyeButton: { paddingHorizontal: 14, paddingVertical: 14 },
  eyeIcon: { fontSize: 18 },
});
