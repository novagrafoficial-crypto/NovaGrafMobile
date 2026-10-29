import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';
import { AuthScreen, EnlaceAuth } from '../components/AuthScreen';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, space, surface, textColors } from '@/constants/theme';

export const LoginView = () => {
  const vm = useLoginViewModel();

  return (
    <AuthScreen
      title="¡Hola de nuevo!"
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

      <View style={styles.separador}>
        <View style={styles.linea} />
        <Text style={styles.o} maxFontSizeMultiplier={1.15}>o continúa con</Text>
        <View style={styles.linea} />
      </View>

      <CustomButton
        title="Continuar con Google"
        variant="outline"
        icon={<Ionicons name="logo-google" size={19} color="#EA4335" />}
        onPress={vm.handleGoogleLogin}
        disabled={vm.isGoogleDisabled || vm.isLoading}
      />
    </AuthScreen>
  );
};

const styles = StyleSheet.create({
  olvide: { alignSelf: 'flex-end', marginTop: -4, marginBottom: space.lg },
  olvideTexto: { fontFamily: fontFamily.semibold, fontSize: 13, color: brandColors.primary },
  separador: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.lg },
  linea: { flex: 1, height: 1, backgroundColor: surface.border },
  o: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.muted },
});
