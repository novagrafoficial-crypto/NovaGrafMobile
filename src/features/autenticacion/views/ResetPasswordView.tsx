import React from 'react';
import { useResetPasswordViewModel } from '../viewmodels/useResetPasswordViewModel';
import { AuthScreen } from '../components/AuthScreen';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { Loading } from '@/shared/components/Loading';

export const ResetPasswordView = () => {
  const vm = useResetPasswordViewModel();

  if (vm.missingData) {
    return (
      <AuthScreen
        headerTitle="Nueva contraseña"
        title="Solicitud inválida"
        subtitle="Necesitas verificar un código antes de cambiar tu contraseña."
      >
        <CustomButton title="Volver a empezar" onPress={vm.goToForgot} />
      </AuthScreen>
    );
  }

  if (vm.success) {
    return (
      <AuthScreen
        headerTitle="Nueva contraseña"
        title="¡Contraseña actualizada!"
        subtitle="Ya puedes iniciar sesión con tu nueva contraseña."
      >
        <CustomButton title="Ir a iniciar sesión" onPress={vm.goToLogin} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      headerTitle="Nueva contraseña"
      title="Crea tu nueva contraseña"
      subtitle="Mínimo 8 caracteres, con una letra y un número."
      error={vm.error}
    >
      <CustomInput
        label="Nueva contraseña"
        placeholder="••••••••"
        isPassword
        value={vm.newPassword}
        onChangeText={vm.setNewPassword}
      />
      <CustomInput
        label="Confirmar contraseña"
        placeholder="••••••••"
        isPassword
        value={vm.confirmPassword}
        onChangeText={vm.setConfirmPassword}
      />
      {vm.isLoading ? <Loading /> : <CustomButton title="Cambiar contraseña" onPress={vm.handleSubmit} />}
    </AuthScreen>
  );
};