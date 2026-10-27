import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useVerifyRecoveryViewModel } from '../viewmodels/useVerifyRecoveryViewModel';
import { AuthScreen } from '../components/AuthScreen';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { Loading } from '@/shared/components/Loading';
import { brandTints } from '@/constants/brand';

export const VerifyRecoveryView = () => {
  const vm = useVerifyRecoveryViewModel();

  return (
    <AuthScreen
      headerTitle="Recuperar contraseña"
      title="Ingresa el código"
      subtitle="Te enviamos un código de 6 dígitos a tu correo."
      error={vm.error}
      info={vm.info}
    >
      <CustomInput
        label="Código de verificación"
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        value={vm.otp}
        onChangeText={vm.handleOtpChange}
      />

      {vm.isLoading ? (
        <Loading />
      ) : (
        <CustomButton title="Verificar código" onPress={vm.handleVerify} style={styles.primaryBtn} />
      )}

      <Text style={styles.resendLabel}>¿No te llegó el código o expiró?</Text>
      <CustomButton
        title={
          vm.cooldown > 0
            ? `Reenviar en ${vm.cooldown}s`
            : vm.isResending
              ? 'Reenviando...'
              : 'Reenviar código'
        }
        variant="outline"
        onPress={vm.handleResend}
        disabled={vm.cooldown > 0 || vm.isResending}
      />
    </AuthScreen>
  );
};

const styles = StyleSheet.create({
  primaryBtn: { marginBottom: 20, borderRadius: 10 },
  resendLabel: {
    color: brandTints.textMuted,
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 10,
  },
});