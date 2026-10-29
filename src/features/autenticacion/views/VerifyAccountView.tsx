import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useVerifyAccountViewModel } from '../viewmodels/useVerifyAccountViewModel';
import { AuthScreen } from '../components/AuthScreen';
import { CodigoOTP } from '../components/CodigoOTP';
import { CustomButton } from '@/shared/components/CustomButton';
import { fontFamily, space, textColors } from '@/constants/theme';

export const VerifyAccountView = () => {
  const vm = useVerifyAccountViewModel();

  if (vm.success) {
    return (
      <AuthScreen title="¡Cuenta activada!" subtitle="Ya puedes iniciar sesión y hacer tu primer pedido." icono="checkmark-circle-outline" conFlecha={false} info={vm.info}>
        <CustomButton title="Ir a iniciar sesión" onPress={vm.goToLogin} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Revisa tu correo"
      subtitle="Escribe el código de 6 dígitos que te enviamos para activar tu cuenta."
      icono="mail-unread-outline"
      conFlecha={false}
      error={vm.error}
      info={vm.info}
    >
      <CodigoOTP valor={vm.otp} onChange={vm.handleOtpChange} />

      <CustomButton title="Activar mi cuenta" onPress={vm.handleVerify} loading={vm.isLoading} disabled={vm.otp.length < 6} />

      <Text style={styles.reenviar} maxFontSizeMultiplier={1.15}>¿No te llegó o ya expiró? Revisa también tu carpeta de spam.</Text>
      <CustomButton
        title={vm.cooldown > 0 ? `Reenviar en ${vm.cooldown}s` : vm.isResending ? 'Reenviando…' : 'Reenviar código'}
        variant="outline"
        onPress={vm.handleResend}
        disabled={vm.cooldown > 0 || vm.isResending}
      />
      <CustomButton title="Ir a iniciar sesión" variant="outline" onPress={vm.goToLogin} style={{ marginTop: space.sm }} />
    </AuthScreen>
  );
};

const styles = StyleSheet.create({
  reenviar: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary, textAlign: 'center', marginTop: space.xl, marginBottom: space.sm },
});
