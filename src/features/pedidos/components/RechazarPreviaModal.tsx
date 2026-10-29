import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { COMENTARIO_MAX } from '../viewmodels/usePedidoDetalleViewModel';

interface Props {
  visible: boolean;
  numeroPrevia: number | null;
  enviando: boolean;
  error: string | null;
  onCancelar: () => void;
  onConfirmar: (comentario: string) => void;
}

const ESCALA = 1.15;

// Pedir cambios en una previa: mismo estilo que el modal de aprobar.
export const RechazarPreviaModal = ({ visible, numeroPrevia, enviando, error, onCancelar, onConfirmar }: Props) => {
  const [comentario, setComentario] = useState('');
  const [enfocado, setEnfocado] = useState(false);

  // Cada vez que se abre para otra previa, el campo empieza vacío
  useEffect(() => { if (visible) setComentario(''); }, [visible, numeroPrevia]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
      <KeyboardAvoidingView style={styles.fondo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <View style={styles.encabezado}>
            <View style={styles.icono}>
              <Ionicons name="create-outline" size={24} color="#B45309" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>Pedir cambios</Text>
              <Text style={styles.subtitulo} maxFontSizeMultiplier={ESCALA}>Previa {numeroPrevia}</Text>
            </View>
          </View>

          <Text style={styles.label} maxFontSizeMultiplier={ESCALA}>¿Qué te gustaría cambiar?</Text>
          <TextInput
            style={[styles.input, enfocado && styles.inputEnfocado]}
            value={comentario}
            onChangeText={setComentario}
            onFocus={() => setEnfocado(true)}
            onBlur={() => setEnfocado(false)}
            placeholder="Ej. Hazlo más grande y cambia el azul por verde"
            placeholderTextColor={textColors.muted}
            multiline
            maxLength={COMENTARIO_MAX}
            editable={!enviando}
            textAlignVertical="top"
            maxFontSizeMultiplier={ESCALA}
          />
          <Text style={styles.contador} maxFontSizeMultiplier={1}>{comentario.length}/{COMENTARIO_MAX}</Text>

          {!!error && (
            <View style={styles.error}>
              <Ionicons name="alert-circle-outline" size={16} color={brandColors.error} />
              <Text style={styles.errorTexto} maxFontSizeMultiplier={ESCALA}>{error}</Text>
            </View>
          )}

          <View style={styles.botones}>
            <PressableScale style={[styles.boton, styles.botonSecundario]} onPress={onCancelar} disabled={enviando}>
              <Text style={styles.textoSecundario} maxFontSizeMultiplier={ESCALA}>Cancelar</Text>
            </PressableScale>
            <PressableScale
              style={[styles.boton, styles.botonPrincipal, enviando && { opacity: 0.7 }]}
              onPress={() => onConfirmar(comentario)}
              disabled={enviando}
            >
              {enviando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.textoPrincipal} maxFontSizeMultiplier={ESCALA}>Enviar cambios</Text>
              )}
            </PressableScale>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: space.xl },
  card: { backgroundColor: surface.card, borderRadius: radius.lg, padding: space.xl, gap: space.sm },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.xs },
  icono: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  subtitulo: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.muted },
  label: { fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },
  input: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: surface.border,
    borderRadius: radius.md,
    padding: space.md,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: textColors.primary,
  },
  inputEnfocado: { borderColor: brandColors.primary, borderWidth: 1.5 },
  contador: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted, textAlign: 'right' },
  error: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 13, color: brandColors.error },
  botones: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  boton: { flex: 1, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  botonSecundario: { borderWidth: 1, borderColor: surface.border },
  botonPrincipal: { backgroundColor: brandColors.primary },
  textoSecundario: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  textoPrincipal: { fontFamily: fontFamily.semibold, fontSize: 15, color: '#FFFFFF' },
});