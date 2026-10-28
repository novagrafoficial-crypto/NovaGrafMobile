import React from 'react';
import { ActivityIndicator, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, surface, textColors } from '@/constants/theme';

type Variant = 'primary' | 'accent' | 'danger' | 'outline';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Muestra una ruedita en lugar del texto y bloquea el botón */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
}: CustomButtonProps) => (
  <PressableScale
    style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled || loading}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    {loading ? (
      <ActivityIndicator color={variant === 'outline' ? brandColors.primary : '#FFFFFF'} />
    ) : (
      <>
        {icon}
        <Text style={variant === 'outline' ? styles.textOutline : styles.text} maxFontSizeMultiplier={1.15}>{title}</Text>
      </>
    )}
  </PressableScale>
);

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primary: { backgroundColor: brandColors.primary },
  accent: { backgroundColor: brandColors.accent },
  danger: { backgroundColor: brandColors.error },
  outline: { backgroundColor: surface.card, borderWidth: 1, borderColor: surface.border },
  disabled: { opacity: 0.55 },
  text: { fontFamily: fontFamily.semibold, color: '#FFFFFF', fontSize: 16 },
  textOutline: { fontFamily: fontFamily.semibold, color: textColors.primary, fontSize: 15 },
});
