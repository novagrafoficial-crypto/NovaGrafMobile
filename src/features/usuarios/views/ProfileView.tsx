import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useProfileViewModel } from '../viewmodels/useProfileViewModel';
import { CustomButton } from '@/shared/components/CustomButton';
import { brandColors } from '@/constants/brand';

// Una sola vista de perfil para cliente y administrador.
export const ProfileView = () => {
  const vm = useProfileViewModel();

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Mi Perfil</Text>
      <Text style={styles.info}>Nombre: {vm.user?.nombre}</Text>
      <Text style={styles.info}>Correo: {vm.user?.correo_electronico}</Text>
      <Text style={styles.info}>Rol: {vm.user?.rol}</Text>
      <CustomButton
        title="Cerrar sesión"
        variant="danger"
        onPress={vm.cerrarSesion}
        style={styles.botonCerrar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 24, backgroundColor: brandColors.background },
  titulo: { fontSize: 24, fontWeight: '700', color: brandColors.primaryDark, marginBottom: 20 },
  info: { fontSize: 16, color: '#333', marginBottom: 8 },
  botonCerrar: { marginTop: 24 },
});
