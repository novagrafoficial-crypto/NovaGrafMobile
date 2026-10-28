import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useVerifyRecoveryViewModel } from '../viewmodels/useVerifyRecoveryViewModel';
import { AuthScreen } from '../components/AuthScreen';
import { CodigoOTP } from '../components/CodigoOTP';
import { CustomButton } from '@/shared/components/CustomButton';
import { fontFamily, space, textColors } from '@/constants/theme';

export const VerifyRecoveryView = () => {
  const vm = useVerifyRecoveryViewModel();

  return (
    <AuthScreen
      title="Ingresa el código"
      subtitle="Te enviamos un código de 6 dígitos a tu correo."
      icono="mail-unread-outline"
      error={vm.error}
      info={vm.info}
    >
      <CodigoOTP valor={vm.otp} onChange={vm.handleOtpChange} />

      <CustomButton title="Verificar código" onPress={vm.handleVerify} loading={vm.isLoading} disabled={vm.otp.length < 6} />

      <Text style={styles.reenviar} maxFontSizeMultiplier={1.15}>¿No te llegó o ya expiró?</Text>
      <CustomButton
        title={vm.cooldown > 0 ? `Reenviar en ${vm.cooldown}s` : vm.isResending ? 'Reenviando…' : 'Reenviar código'}
        variant="outline"
        onPress={vm.handleResend}
        disabled={vm.cooldown > 0 || vm.isResending}
      />
    </AuthScreen>
  );
};

const styles = StyleSheet.create({
  reenviar: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary, textAlign: 'center', marginTop: space.xl, marginBottom: space.sm },
});
