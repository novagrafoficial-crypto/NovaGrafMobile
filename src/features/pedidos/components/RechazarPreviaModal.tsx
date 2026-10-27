import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { CustomButton } from '@/shared/components/CustomButton';
import { brandColors, brandTints } from '@/constants/brand';
import { COMENTARIO_MAX } from '../viewmodels/usePedidoDetalleViewModel';

interface Props {
  visible: boolean;
  numeroPrevia: number | null;
  enviando: boolean;
  error: string | null;
  onCancelar: () => void;
  onConfirmar: (comentario: string) => void;
}

export const RechazarPreviaModal = ({ visible, numeroPrevia, enviando, error, onCancelar, onConfirmar }: Props) => {
  const [comentario, setComentario] = useState('');

  // Cada vez que se abre para otra previa, el campo empieza vacío
  useEffect(() => { if (visible) setComentario(''); }, [visible, numeroPrevia]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.caja}>
          <Text style={styles.titulo}>Pedir cambios en la previa {numeroPrevia}</Text>
          <Text style={styles.ayuda}>
            Cuéntanos qué te gustaría cambiar (colores, textos, tamaño, posición…). El diseñador te enviará una nueva versión.
          </Text>

          <TextInput
            style={styles.input}
            value={comentario}
            onChangeText={setComentario}
            placeholder="Ej. Hazlo más grande y cambia el azul por verde"
            placeholderTextColor={brandTints.textMuted}
            multiline
            maxLength={COMENTARIO_MAX}
            editable={!enviando}
            textAlignVertical="top"
          />
          <Text style={styles.contador}>{comentario.length}/{COMENTARIO_MAX}</Text>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.acciones}>
            <CustomButton title="Cancelar" variant="outline" onPress={onCancelar} disabled={enviando} style={styles.btn} />
            <CustomButton
              title={enviando ? 'Enviando…' : 'Enviar'}
              onPress={() => onConfirmar(comentario)}
              disabled={enviando}
              style={styles.btn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: brandTints.overlay, justifyContent: 'center', padding: 20 },
  caja: { backgroundColor: brandColors.white, borderRadius: 16, padding: 16, gap: 8 },
  titulo: { fontSize: 16, fontWeight: '800', color: brandColors.primaryDark },
  ayuda: { fontSize: 13, color: brandTints.textMuted },
  input: {
    minHeight: 110, borderWidth: 1, borderColor: brandTints.border, borderRadius: 10,
    backgroundColor: brandTints.surfaceMuted, padding: 10, fontSize: 14, color: brandColors.primaryDark,
  },
  contador: { fontSize: 11, color: brandTints.textMuted, textAlign: 'right' },
  error: { fontSize: 12, fontWeight: '600', color: brandColors.error },
  acciones: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: { flex: 1 },
});