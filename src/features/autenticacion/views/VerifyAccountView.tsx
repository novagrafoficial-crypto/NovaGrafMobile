import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVerifyAccountViewModel } from '../viewmodels/useVerifyAccountViewModel';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { Loading } from '@/shared/components/Loading';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors, brandTints } from '@/constants/brand';

export const VerifyAccountView = () => {
  const vm = useVerifyAccountViewModel();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: brandColors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Verificar cuenta</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <FadeInView style={styles.card}>
          <Text style={styles.title}>Revisa tu correo</Text>
          <Text style={styles.subtitle}>
            Ingresa el código de 6 dígitos que enviamos a tu correo.
          </Text>

          {vm.error && <Text style={styles.error}>{vm.error}</Text>}
          {vm.info && <Text style={styles.info}>{vm.info}</Text>}

          {vm.success ? (
            <CustomButton title="Ir a iniciar sesión" onPress={vm.goToLogin} />
          ) : (
            <>
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
                <CustomButton
                  title="Verificar cuenta"
                  onPress={vm.handleVerify}
                  style={styles.primaryBtn}
                />
              )}

              <Text style={styles.resendLabel}>¿No recibiste el código o expiró?</Text>
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
            </>
          )}
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: brandColors.primaryDark,
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: { color: brandColors.white, fontSize: 17, fontWeight: '600' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: brandColors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: brandColors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: brandColors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: brandTints.textMuted,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  error: { color: brandColors.error, textAlign: 'center', marginBottom: 16, fontWeight: '500' },
  info: { color: brandColors.primary, textAlign: 'center', marginBottom: 16, fontWeight: '500' },
  primaryBtn: { marginBottom: 20, borderRadius: 10 },
  resendLabel: {
    color: brandTints.textMuted,
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 10,
  },
});