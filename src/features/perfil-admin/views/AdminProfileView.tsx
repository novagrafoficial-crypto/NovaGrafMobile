import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAdminProfileViewModel } from '../viewmodels/useAdminProfileViewModel';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { FadeInView } from '@/shared/components/FadeInView';
import { CustomButton } from '@/shared/components/CustomButton';
import { ModalConfirmacionLogout } from '@/shared/components/ModalConfirmacionLogout';
import { getInitials } from '@/shared/utils/getInitials';
import { brandColors, brandTints } from '@/constants/brand';

// Perfil del administrador (el del cliente vive en features/perfil-cliente).
export const AdminProfileView = () => {
  const vm = useAdminProfileViewModel();

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title="Mi perfil" />

      <ModalConfirmacionLogout
        visible={vm.logoutVisible}
        onConfirmar={vm.confirmarLogout}
        onCancelar={vm.cancelarLogout}
      />

      <View style={styles.contenido}>
        <FadeInView style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{getInitials(vm.user?.nombre)}</Text>
          </View>
          <Text style={styles.nombre}>{vm.user?.nombre}</Text>
          <Text style={styles.correo}>{vm.user?.correo_electronico}</Text>
          <View style={styles.rol}>
            <Text style={styles.rolTexto}>Administrador</Text>
          </View>
        </FadeInView>

        <FadeInView delay={120}>
          <CustomButton title="Cerrar sesión" variant="danger" onPress={vm.pedirLogout} />
        </FadeInView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  contenido: { padding: 20, gap: 16 },
  card: { backgroundColor: brandColors.white, borderRadius: 18, padding: 24, alignItems: 'center' },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: brandColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarTexto: { color: brandColors.white, fontSize: 26, fontWeight: '800' },
  nombre: { fontSize: 20, fontWeight: '800', color: brandColors.primaryDark },
  correo: { fontSize: 13, color: brandTints.textMuted, marginTop: 2, marginBottom: 12 },
  rol: { backgroundColor: brandTints.accentSoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  rolTexto: { color: brandColors.primary, fontWeight: '700', fontSize: 12 },
});
