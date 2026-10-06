import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLoginViewModel } from '../../features/auth/viewmodels/useLoginViewModel';

export default function LoginScreen() {
  // Consumo estricto del hook como ViewModel (Cumpliendo el patrón MVVM)
  const { handleGoogleLogin, isGoogleDisabled, isLoading, error } = useLoginViewModel();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NovaGraf Mobile</Text>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      {isLoading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        <TouchableOpacity 
          style={[styles.buttonGoogle, isGoogleDisabled && styles.buttonDisabled]} 
          onPress={handleGoogleLogin}
          disabled={isGoogleDisabled}
        >
          <Text style={styles.buttonText}>Continuar con Google 🚀</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, color: '#111827' },
  errorText: { color: '#EF4444', marginBottom: 16, textAlign: 'center', fontWeight: '500' },
  buttonGoogle: { backgroundColor: '#4285F4', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#93C5FD' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
