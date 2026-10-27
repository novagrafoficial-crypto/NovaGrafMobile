import React from 'react';
import { useForgotPasswordViewModel } from '../viewmodels/useForgotPasswordViewModel';
import { AuthScreen } from '../components/AuthScreen';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { Loading } from '@/shared/components/Loading';

export const ForgotPasswordView = () => {
  const vm = useForgotPasswordViewModel();

  return (
    <AuthScreen
      headerTitle="Recuperar contraseña"
      title="¿Olvidaste tu contraseña?"
      subtitle="Escribe tu correo y te enviaremos un código de 6 dígitos."
      error={vm.error}
      info={vm.info}
    >
      <CustomInput
        label="Correo electrónico"
        placeholder="tu@correo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={vm.email}
        onChangeText={vm.setEmail}
      />
      {vm.isLoading ? <Loading /> : <CustomButton title="Enviar código" onPress={vm.handleSubmit} />}
    </AuthScreen>
  );
};