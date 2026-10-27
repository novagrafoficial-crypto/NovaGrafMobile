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
import { useRouter } from 'expo-router';
import { useRegisterViewModel } from '../viewmodels/useRegisterViewModel';
import type { RegistroForm } from '../models/Registro';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { Loading } from '@/shared/components/Loading';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';

export const RegisterView = () => {
  const router = useRouter();
  const vm = useRegisterViewModel();
  const insets = useSafeAreaInsets();

  // Un campo = input + su mensaje de error debajo
  const field = (name: keyof RegistroForm, label: string, props: any = {}) => (
    <View key={name}>
      <CustomInput
        label={label}
        value={vm.form[name]}
        onChangeText={(v: string) => vm.setField(name, v)}
        {...props}
      />
      {!!vm.errors[name] && <Text style={styles.fieldError}>{vm.errors[name]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: brandColors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <PressableScale
          onPress={() => (vm.step === 2 ? vm.handleBack() : router.back())}
          style={styles.backButton}
          hitSlop={12}
          scaleTo={0.85}
        >
          <Text style={styles.backIcon}>←</Text>
        </PressableScale>
        <Text style={styles.headerTitle}>Crear cuenta</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <FadeInView style={styles.card}>
          <Text style={styles.title}>Regístrate</Text>
          <Text style={styles.step}>Paso {vm.step} de 2</Text>

          {vm.error && <Text style={styles.error}>{vm.error}</Text>}

          {vm.step === 1 ? (
            <>
              {field('name', 'Nombre(s)', { placeholder: 'Tu nombre' })}
              {field('lastNameP', 'Apellido paterno', { placeholder: 'Apellido paterno' })}
              {field('lastNameM', 'Apellido materno', { placeholder: 'Apellido materno' })}
              {field('username', 'Nombre de usuario', {
                placeholder: 'usuario_123',
                autoCapitalize: 'none',
              })}
              {field('birthDate', 'Fecha de nacimiento', {
                placeholder: 'AAAA-MM-DD',
                keyboardType: 'number-pad',
                maxLength: 10,
              })}
              <CustomButton title="Continuar" onPress={vm.handleNext} style={styles.primaryBtn} />
            </>
          ) : (
            <>
              {field('address', 'Domicilio', { placeholder: 'Calle, número, colonia' })}
              {field('phone', 'Teléfono', {
                placeholder: '7711234567',
                keyboardType: 'phone-pad',
                maxLength: 15,
              })}
              {field('email', 'Correo electrónico', {
                placeholder: 'tu@correo.com',
                autoCapitalize: 'none',
                keyboardType: 'email-address',
              })}
              {field('password', 'Contraseña', { placeholder: '••••••••', isPassword: true })}
              {field('confirmPassword', 'Confirmar contraseña', {
                placeholder: '••••••••',
                isPassword: true,
              })}

              {vm.isLoading ? (
                <Loading />
              ) : (
                <>
                  <CustomButton
                    title="Crear cuenta"
                    onPress={vm.handleSubmit}
                    style={styles.primaryBtn}
                  />
                  <CustomButton title="Atrás" variant="outline" onPress={vm.handleBack} />
                </>
              )}
            </>
          )}

          <PressableScale
            onPress={() => router.replace('/(auth)/login' as any)}
            style={{ marginTop: 20 }}
            scaleTo={0.97}
          >
            <Text style={styles.loginText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </PressableScale>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: brandColors.white, fontSize: 26, fontWeight: '600', lineHeight: 26 },
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
    fontSize: 26,
    fontWeight: '700',
    color: brandColors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  step: { textAlign: 'center', color: brandTints.textMuted, fontSize: 13, marginBottom: 20 },
  error: { color: brandColors.error, textAlign: 'center', marginBottom: 16, fontWeight: '500' },
  fieldError: { color: brandColors.error, fontSize: 12, marginTop: -10, marginBottom: 12 },
  primaryBtn: { marginBottom: 12, borderRadius: 10 },
  loginText: { color: brandColors.primary, textAlign: 'center', fontSize: 14 },
});