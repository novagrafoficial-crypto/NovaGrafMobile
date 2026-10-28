import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from './PressableScale';
import { fontFamily } from '@/constants/theme';
import { brandColors, brandTints } from '@/constants/brand';

interface Props {
  visible: boolean;
  titulo: string;
  mensaje: string;
  /** Nombre de Ionicons (ej. "log-out-outline") o un emoji (las pantallas viejas lo siguen usando). */
  icono?: string;
  /** Línea pequeña opcional bajo el mensaje (ej. "Esta acción no se puede deshacer."). */
  aviso?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

// Si el texto parece nombre de Ionicons ("trash-outline") se dibuja el ícono; si no, se muestra como emoji.
const esIonicon = (icono: string) => /^[a-z0-9-]+$/.test(icono) && icono in Ionicons.glyphMap;

// Modal de confirmación genérico: sirve para eliminar, vaciar, cerrar sesión, etc.
export const ModalConfirmacion = ({
  visible,
  titulo,
  mensaje,
  icono = '⚠️',
  aviso,
  textoConfirmar = 'Sí, eliminar',
  textoCancelar = 'Cancelar',
  onConfirmar,
  onCancelar,
}: Props) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          {esIonicon(icono) ? (
            <Ionicons name={icono as keyof typeof Ionicons.glyphMap} size={26} color={brandColors.error} />
          ) : (
            <Text style={styles.icon}>{icono}</Text>
          )}
        </View>
        <Text style={styles.title}>{titulo}</Text>
        <Text style={[styles.message, !aviso && styles.messageLast]}>{mensaje}</Text>
        {!!aviso && <Text style={styles.aviso}>{aviso}</Text>}

        <View style={styles.buttons}>
          <PressableScale style={[styles.btn, styles.btnCancel]} onPress={onCancelar}>
            <Text style={styles.btnCancelText}>{textoCancelar}</Text>
          </PressableScale>
          <PressableScale style={[styles.btn, styles.btnConfirm]} onPress={onConfirmar}>
            <Text style={styles.btnConfirmText}>{textoConfirmar}</Text>
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
    maxWidth: 340,
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
  title: { fontFamily: fontFamily.bold, fontSize: 18, color: '#111111', marginBottom: 6 },
  message: { fontFamily: fontFamily.regular, fontSize: 14, color: '#3F3F46', textAlign: 'center', marginBottom: 8 },
  messageLast: { marginBottom: 18 },
  aviso: { fontFamily: fontFamily.regular, fontSize: 12, color: brandTints.textMuted, textAlign: 'center', marginBottom: 18 },
  buttons: { flexDirection: 'row', gap: 10, width: '100%' },
  btn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { borderWidth: 1, borderColor: '#E4E4E7', backgroundColor: brandColors.white },
  btnCancelText: { fontFamily: fontFamily.semibold, fontSize: 15, color: '#111111' },
  btnConfirm: { backgroundColor: brandColors.error },
  btnConfirmText: { fontFamily: fontFamily.semibold, fontSize: 15, color: brandColors.white },
});