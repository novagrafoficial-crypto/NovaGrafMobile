import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { PressableScale } from './PressableScale';
import { brandColors, brandTints } from '@/constants/brand';

interface Props {
  visible: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

// Compartido por el perfil del cliente y el del administrador.
export const ModalConfirmacionLogout: React.FC<Props> = ({ visible, onConfirmar, onCancelar }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🚪</Text>
        </View>
        <Text style={styles.title}>Cerrar sesión</Text>
        <Text style={styles.message}>¿Estás seguro de que deseas cerrar sesión?</Text>

        <View style={styles.buttons}>
          <PressableScale style={[styles.btn, styles.btnCancel]} onPress={onCancelar}>
            <Text style={styles.btnCancelText}>Cancelar</Text>
          </PressableScale>
          <PressableScale style={[styles.btn, styles.btnConfirm]} onPress={onConfirmar}>
            <Text style={styles.btnConfirmText}>Sí, salir</Text>
          </PressableScale>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: brandTints.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: brandColors.white,
    borderRadius: 18,
    padding: 22,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: brandTints.errorSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: { fontSize: 26 },
  title: { fontSize: 18, fontWeight: '700', color: brandColors.primaryDark, marginBottom: 6 },
  message: { fontSize: 14, color: brandTints.textMuted, textAlign: 'center', marginBottom: 18 },
  buttons: { flexDirection: 'row', gap: 10, width: '100%' },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnCancel: { backgroundColor: brandTints.surfaceMuted },
  btnCancelText: { color: brandColors.primaryDark, fontWeight: '600' },
  btnConfirm: { backgroundColor: brandColors.error },
  btnConfirmText: { color: brandColors.white, fontWeight: '700' },
});
