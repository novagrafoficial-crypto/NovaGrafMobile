import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';
import type { ArchivoComprobante } from '../models/Pago';

interface Props {
  archivo: ArchivoComprobante | null;
  onGaleria: () => void;
  onArchivo: () => void;
  onQuitar: () => void;
}

export const ComprobantePicker = ({ archivo, onGaleria, onArchivo, onQuitar }: Props) => (
  <View style={styles.caja}>
    <Text style={styles.titulo}>Comprobante de pago</Text>
    {!archivo ? (
      <View style={styles.botones}>
        <PressableScale style={styles.boton} onPress={onGaleria}>
          <Ionicons name="images-outline" size={24} color={brandColors.primary} />
          <Text style={styles.botonTxt}>Galería</Text>
        </PressableScale>
        <PressableScale style={styles.boton} onPress={onArchivo}>
          <Ionicons name="document-attach-outline" size={24} color={brandColors.primary} />
          <Text style={styles.botonTxt}>PDF / archivo</Text>
        </PressableScale>
      </View>
    ) : (
      <View style={styles.elegido}>
        {archivo.mimeType.startsWith('image/') && <Image source={{ uri: archivo.uri }} style={styles.preview} resizeMode="cover" />}
        <View style={styles.fila}>
          <Ionicons name="checkmark-circle" size={20} color={brandColors.accent} />
          <Text style={styles.nombre} numberOfLines={1}>{archivo.name}</Text>
          <PressableScale onPress={onQuitar} hitSlop={10} accessibilityLabel="Quitar archivo">
            <Ionicons name="trash-outline" size={20} color={brandColors.error} />
          </PressableScale>
        </View>
      </View>
    )}
    <Text style={styles.hint}>JPG, PNG o PDF (máx. 5 MB)</Text>
  </View>
);

const styles = StyleSheet.create({
  caja: { backgroundColor: brandColors.white, borderRadius: 14, padding: 14, gap: 10 },
  titulo: { fontSize: 15, fontWeight: '800', color: brandColors.primaryDark },
  botones: { flexDirection: 'row', gap: 10 },
  boton: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', gap: 4, backgroundColor: brandTints.surfaceMuted, borderWidth: 1.5, borderColor: brandTints.border },
  botonTxt: { fontSize: 13, fontWeight: '700', color: brandColors.primaryDark },
  elegido: { gap: 8 },
  preview: { width: '100%', height: 160, borderRadius: 10, backgroundColor: brandTints.surfaceMuted },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  nombre: { flex: 1, fontSize: 13, color: brandColors.primaryDark, fontWeight: '600' },
  hint: { fontSize: 11, color: brandTints.textMuted },
});