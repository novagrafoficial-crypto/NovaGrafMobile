import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResetPasswordViewModel } from '../viewmodels/useResetPasswordViewModel';
import { AuthScreen } from '../components/AuthScreen';
import { reglasPassword } from '../utils/validaciones';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

export const ResetPasswordView = () => {
  const vm = useResetPasswordViewModel();

  if (vm.missingData) {
    return (
      <AuthScreen title="Solicitud inválida" subtitle="Necesitas verificar un código antes de cambiar tu contraseña." icono="alert-circle-outline">
        <CustomButton title="Volver a empezar" onPress={vm.goToForgot} />
      </AuthScreen>
    );
  }

  if (vm.success) {
    return (
      <AuthScreen title="¡Contraseña actualizada!" subtitle="Ya puedes iniciar sesión con tu nueva contraseña." icono="checkmark-circle-outline" conFlecha={false}>
        <CustomButton title="Ir a iniciar sesión" onPress={vm.goToLogin} />
      </AuthScreen>
    );
  }

  const coinciden = !!vm.confirmPassword && vm.confirmPassword === vm.newPassword;

  return (
    <AuthScreen title="Crea tu nueva contraseña" subtitle="Usa una que no hayas usado antes." icono="lock-closed-outline" error={vm.error}>
      <CustomInput
        label="Nueva contraseña"
        icono="lock-closed-outline"
        placeholder="Crea una contraseña"
        isPassword
        textContentType="newPassword"
        value={vm.newPassword}
        onChangeText={vm.setNewPassword}
      />

      <View style={styles.reglas}>
        {reglasPassword(vm.newPassword).map((r) => (
          <View key={r.texto} style={styles.regla}>
            <Ionicons name={r.ok ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={r.ok ? '#166534' : textColors.muted} />
            <Text style={[styles.reglaTexto, r.ok && { color: '#166534' }]} maxFontSizeMultiplier={1.15}>{r.texto}</Text>
          </View>
        ))}
      </View>

      <CustomInput
        label="Confirmar contraseña"
        icono="lock-closed-outline"
        placeholder="Escríbela otra vez"
        isPassword
        textContentType="newPassword"
        value={vm.confirmPassword}
        onChangeText={vm.setConfirmPassword}
        error={vm.confirmPassword && !coinciden ? 'Las contraseñas no coinciden' : null}
      />
      <CustomButton title="Cambiar contraseña" onPress={vm.handleSubmit} loading={vm.isLoading} />
    </AuthScreen>
  );
};

const styles = StyleSheet.create({
  reglas: {
    gap: 4,
    marginTop: -8,
    marginBottom: space.lg,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: surface.card,
    borderWidth: 1,
    borderColor: surface.border,
  },
  regla: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reglaTexto: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
});
