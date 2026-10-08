import React from 'react';
import { Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { brandColors } from '@/constants/brand';

type Variant = 'primary' | 'accent' | 'danger' | 'outline';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
}: CustomButtonProps) => (
  <TouchableOpacity
    style={[styles.base, styles[variant], disabled && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled}
  >
    {icon}
    <Text style={variant === 'outline' ? styles.textOutline : styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  base: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primary: { backgroundColor: brandColors.primary },
  accent: { backgroundColor: brandColors.accent },
  danger: { backgroundColor: brandColors.error },
  outline: {
    backgroundColor: brandColors.white,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  disabled: { opacity: 0.5 },
  text: { color: brandColors.white, fontWeight: '700', fontSize: 16 },
  textOutline: { color: '#333', fontWeight: '600', fontSize: 15 },
});
