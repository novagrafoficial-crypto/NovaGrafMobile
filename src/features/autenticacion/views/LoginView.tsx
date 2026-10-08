import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { Loading } from '@/shared/components/Loading';
import { brandColors } from '@/constants/brand';

export const LoginView = () => {
  const router = useRouter();
  const vm = useLoginViewModel();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: brandColors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* HEADER oscuro con flecha atrás */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Iniciar sesión</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* CONTENIDO */}
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Bienvenido</Text>

          {vm.error && <Text style={styles.error}>{vm.error}</Text>}

          <CustomInput
            label="Correo electrónico"
            placeholder="tu@correo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={vm.email}
            onChangeText={vm.setEmail}
          />

          <CustomInput
            label="Contraseña"
            placeholder="••••••••"
            isPassword
            value={vm.password}
            onChangeText={vm.setPassword}
          />

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {vm.isLoading ? (
            <Loading />
          ) : (
            <>
              <CustomButton
                title="Iniciar sesión"
                onPress={vm.handleCredentialsLogin}
                style={styles.primaryBtn}
              />

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.or}>o continúa con</Text>
                <View style={styles.line} />
              </View>

              <CustomButton
                title="Google"
                variant="outline"
                icon={<Text style={styles.googleIcon}>G</Text>}
                onPress={vm.handleGoogleLogin}
                disabled={vm.isGoogleDisabled}
              />
            </>
          )}

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register' as any)}
            style={{ marginTop: 20 }}
          >
            <Text style={styles.registerText}>¿No tienes una cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
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
    shadowColor: '#000',
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
    marginBottom: 24,
  },
  error: { color: brandColors.error, textAlign: 'center', marginBottom: 16, fontWeight: '500' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: brandColors.primary, fontSize: 13 },
  primaryBtn: { marginBottom: 16, borderRadius: 10 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  line: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  or: { marginHorizontal: 12, color: '#999', fontSize: 12 },
  googleIcon: { fontSize: 18, fontWeight: '700', color: '#EA4335' },
  registerText: { color: brandColors.primary, textAlign: 'center', fontSize: 14 },
});
