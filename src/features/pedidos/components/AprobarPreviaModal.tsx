import React from 'react';
import { Modal, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import type { PreviaPedido } from '../models/Pedido';

interface Props {
  previa: PreviaPedido | null;
  enviando: boolean;
  error: string | null;
  onCancelar: () => void;
  onConfirmar: () => void;
}

const ESCALA = 1.15;

// Confirmación para aprobar una previa, con el diseño de la app (en lugar del Alert del sistema).
export const AprobarPreviaModal = ({ previa, enviando, error, onCancelar, onConfirmar }: Props) => {
  const imagen = resolveImageUrl(previa?.imagen_url) ?? undefined;

  return (
    <Modal visible={!!previa} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={styles.fondo}>
        <View style={styles.card}>
          {/* Miniatura de la previa que se va a aprobar */}
          {!!imagen && (
            <View style={styles.imagenBox}>
              <Image source={{ uri: imagen }} style={styles.imagen} contentFit="contain" cachePolicy="memory-disk" />
              <View style={styles.etiqueta}>
                <Text style={styles.etiquetaTexto} maxFontSizeMultiplier={1}>Previa {previa?.numero_previa}</Text>
              </View>
            </View>
          )}

          <View style={styles.icono}>
            <Ionicons name="checkmark-circle-outline" size={28} color={brandColors.primary} />
          </View>

          <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>¿Aprobar esta previa?</Text>
          <Text style={styles.mensaje} maxFontSizeMultiplier={ESCALA}>
            Tu pedido pasará a producción con este diseño.
          </Text>

          {/* Aviso importante: ya no se puede cambiar */}
          <View style={styles.aviso}>
            <Ionicons name="lock-closed-outline" size={16} color="#92400E" />
            <Text style={styles.avisoTexto} maxFontSizeMultiplier={ESCALA}>Después ya no podrás cambiar el diseño.</Text>
          </View>

          {!!error && (
            <View style={styles.error}>
              <Ionicons name="alert-circle-outline" size={16} color={brandColors.error} />
              <Text style={styles.errorTexto} maxFontSizeMultiplier={ESCALA}>{error}</Text>
            </View>
          )}

          <View style={styles.botones}>
            <PressableScale style={[styles.boton, styles.botonSecundario]} onPress={onCancelar} disabled={enviando}>
              <Text style={styles.textoSecundario} maxFontSizeMultiplier={ESCALA}>Revisar otra vez</Text>
            </PressableScale>
            <PressableScale
              style={[styles.boton, styles.botonPrincipal, enviando && { opacity: 0.7 }]}
              onPress={onConfirmar}
              disabled={enviando}
            >
              {enviando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.textoPrincipal} maxFontSizeMultiplier={ESCALA}>Sí, aprobar</Text>
              )}
            </PressableScale>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: space.xl },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.xl,
    alignItems: 'center',
    gap: space.sm,
  },
  imagenBox: {
    alignSelf: 'stretch',
    height: 160,
    borderRadius: radius.md,
    backgroundColor: surface.muted,
    overflow: 'hidden',
    marginBottom: space.sm,
  },
  imagen: { width: '100%', height: '100%' },
  etiqueta: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  etiquetaTexto: { fontFamily: fontFamily.semibold, fontSize: 12, color: '#FFFFFF' },
  icono: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E6F2EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary, textAlign: 'center' },
  mensaje: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },
  aviso: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    marginTop: 4,
  },
  avisoTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 13, color: '#92400E' },
  error: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 13, color: brandColors.error },
  botones: { flexDirection: 'row', gap: space.sm, alignSelf: 'stretch', marginTop: space.md },
  boton: { flex: 1, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  botonSecundario: { borderWidth: 1, borderColor: surface.border },
  botonPrincipal: { backgroundColor: brandColors.primary },
  textoSecundario: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  textoPrincipal: { fontFamily: fontFamily.semibold, fontSize: 15, color: '#FFFFFF' },
});