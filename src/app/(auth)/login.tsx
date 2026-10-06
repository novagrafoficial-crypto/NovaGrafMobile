import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useLoginViewModel } from '@/features/auth/viewmodels/useLoginViewModel';
import { brandColors } from '@/constants/brand';

export default function LoginScreen() {
  const { email, setEmail, password, setPassword, isLoading, error, handleLogin } =
    useLoginViewModel();

  const onSubmit = async () => {
    const user = await handleLogin();
    if (user) {
      if (user.role === 'admin') {
        router.replace({ pathname: '(admin)/dashboard' as any });
      } else {
        router.replace({ pathname: '/home' as any });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Bienvenido de nuevo</Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@correo.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={brandColors.white} />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.background,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: brandColors.white,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: brandColors.primaryDark,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#5F5E5A',
    marginBottom: 4,
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#B4B2A9',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
    fontSize: 14,
    marginBottom: 14,
    backgroundColor: brandColors.white,
  },
  error: {
    color: brandColors.error,
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: brandColors.accent,
    borderRadius: 8,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: brandColors.primaryDark,
    fontWeight: '600',
    fontSize: 14,
  },
});