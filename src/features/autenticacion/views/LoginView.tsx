import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';
import { AuthScreen, EnlaceAuth } from '../components/AuthScreen';
import { BotonGoogle } from '../components/BotonGoogle';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, space } from '@/constants/theme';

export const LoginView = () => {
  const vm = useLoginViewModel();

  return (
    <AuthScreen
      title="¡Bienvenido!"
      subtitle="Inicia sesión para ver precios, personalizar y seguir tus pedidos."
      icono="person-outline"
      onBack={vm.volver}
      error={vm.error}
      pie={<EnlaceAuth texto="¿No tienes cuenta?" accion="Regístrate" onPress={vm.irARegistro} />}
    >
      <CustomInput
        label="Correo electrónico"
        icono="mail-outline"
        placeholder="nombre@correo.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
        value={vm.email}
        onChangeText={vm.setEmail}
        onBlur={vm.revisarEmail}
        error={vm.errorEmail}
      />

      <CustomInput
        label="Contraseña"
        icono="lock-closed-outline"
        placeholder="Tu contraseña"
        isPassword
        autoComplete="password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={vm.handleCredentialsLogin}
        value={vm.password}
        onChangeText={vm.setPassword}
        error={vm.errorPassword}
      />

      <PressableScale style={styles.olvide} onPress={vm.irARecuperar} hitSlop={8} scaleTo={0.95}>
        <Text style={styles.olvideTexto} maxFontSizeMultiplier={1.15}>¿Olvidaste tu contraseña?</Text>
      </PressableScale>

      <CustomButton title="Iniciar sesión" onPress={vm.handleCredentialsLogin} loading={vm.isLoading} />

      <BotonGoogle
        separador="o continúa con"
        onPress={vm.handleGoogleLogin}
        loading={vm.isGoogleLoading}
        disabled={vm.isLoading}
      />
    </AuthScreen>
  );
};

const styles = StyleSheet.create({
  olvide: { alignSelf: 'flex-end', marginTop: -4, marginBottom: space.lg },
  olvideTexto: { fontFamily: fontFamily.semibold, fontSize: 13, color: brandColors.primary },
});