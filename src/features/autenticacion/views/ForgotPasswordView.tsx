import React from 'react';
import { useForgotPasswordViewModel } from '../viewmodels/useForgotPasswordViewModel';
import { AuthScreen } from '../components/AuthScreen';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';

export const ForgotPasswordView = () => {
  const vm = useForgotPasswordViewModel();

  return (
    <AuthScreen
      title="Recupera tu contraseña"
      subtitle="Escribe tu correo y te enviaremos un código de 6 dígitos."
      icono="key-outline"
      error={vm.error}
      info={vm.info}
    >
      <CustomInput
        label="Correo electrónico"
        icono="mail-outline"
        placeholder="nombre@correo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={vm.handleSubmit}
        value={vm.email}
        onChangeText={(t) => vm.setEmail(t.replace(/\s/g, ''))}
      />
      <CustomButton title="Enviar código" onPress={vm.handleSubmit} loading={vm.isLoading} />
    </AuthScreen>
  );
};
