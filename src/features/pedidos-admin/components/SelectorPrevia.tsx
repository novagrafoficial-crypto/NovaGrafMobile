import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { brandColors, brandTints } from '@/constants/brand';
import { PressableScale } from '@/shared/components/PressableScale';
import type { ArchivoPrevia } from '../models/PedidoAdmin';

interface Props {
  titulo: string;
  archivo: ArchivoPrevia | null;
  onElegir: () => void;
  onQuitar: () => void;
  disabled: boolean;
}

// Elige una imagen de la galería para enviarla como previa.
export const SelectorPrevia = ({ titulo, archivo, onElegir, onQuitar, disabled }: Props) => (
  <View style={styles.selector}>
    <Text style={styles.titulo}>{titulo}</Text>
    {archivo ? (
      <View style={styles.elegido}>
        <Image source={{ uri: archivo.uri }} style={styles.img} resizeMode="cover" />
        <View style={styles.fila}>
          <Text style={styles.nombre} numberOfLines={1}>
            ✓ {archivo.name}
          </Text>
          {!disabled && (
            <PressableScale onPress={onQuitar} hitSlop={10}>
              <Text style={styles.quitar}>✕</Text>
            </PressableScale>
          )}
        </View>
      </View>
    ) : (
      <PressableScale style={styles.boton} onPress={onElegir} disabled={disabled}>
        <Text style={styles.botonTxt}>🖼️ Elegir de la galería</Text>
      </PressableScale>
    )}
  </View>
);

const styles = StyleSheet.create({
  selector: { gap: 6 },
  titulo: { fontSize: 12, color: brandTints.textMuted, fontWeight: '600' },
  boton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: brandTints.surfaceMuted,
    borderWidth: 1.5,
    borderColor: brandTints.border,
  },
  botonTxt: { fontSize: 13, fontWeight: '700', color: brandColors.primaryDark },
  elegido: { gap: 8 },
  img: { width: '100%', height: 170, borderRadius: 10, backgroundColor: brandTints.surfaceMuted },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  nombre: { flex: 1, fontSize: 12, color: brandColors.primary, fontWeight: '600' },
  quitar: { fontSize: 18, fontWeight: '800', color: brandColors.error },
});
