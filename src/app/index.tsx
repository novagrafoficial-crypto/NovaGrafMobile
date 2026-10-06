import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '@/shared/hooks/useSession';
import { brandColors } from '@/constants/brand';

export default function WelcomeLandingScreen() {
  const { user, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    // Si ya tiene sesión iniciada previamente, lo sacamos del menú público y lo mandamos a su rol
    if (user?.role === 'client') router.replace({ pathname: '/home' as any });
    if (user?.role === 'admin') router.replace({ pathname: '(admin)/dashboard' as any });
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: brandColors.background }}>
        <ActivityIndicator size="large" color={brandColors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#1A3D3E' }}>
      {/* Menú Lateral Desplegable (Cajón blanco izquierdo) */}
      <View style={{ width: '70%', backgroundColor: brandColors.white, padding: 24, justifyContent: 'space-between', paddingTop: 60 }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: brandColors.primaryDark, marginBottom: 4 }}>Nova Graf</Text>
          <Text style={{ fontSize: 14, color: '#666666', marginBottom: 40 }}>Móvil</Text>
          
          <TouchableOpacity style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: '#F0F0F0' }}>
            <Text style={{ fontSize: 16, color: brandColors.primaryDark, fontWeight: '600' }}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: '#F0F0F0' }}>
            <Text style={{ fontSize: 16, color: '#555555' }}>Catálogo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: '#F0F0F0' }}>
            <Text style={{ fontSize: 16, color: '#555555' }}>Contacto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: '#F0F0F0' }}>
            <Text style={{ fontSize: 16, color: '#555555' }}>Nosotros</Text>
          </TouchableOpacity>
        </View>

        {/* Botón Verde Institucional para abrir el Formulario */}
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '(auth)/login' as any })}
          style={{ backgroundColor: brandColors.accent, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 }}
        >
          <Text style={{ color: brandColors.white, fontWeight: 'bold', fontSize: 16 }}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Sombra o espacio de fondo oscuro del resto de la pantalla */}
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
    </View>
  );
}
