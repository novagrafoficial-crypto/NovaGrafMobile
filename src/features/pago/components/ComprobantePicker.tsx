import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
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
        <PressableScale style={styles.boton} onPress={onGaleria}><Text style={styles.botonTxt}>🖼️ Galería</Text></PressableScale>
        <PressableScale style={styles.boton} onPress={onArchivo}><Text style={styles.botonTxt}>📎 PDF / archivo</Text></PressableScale>
      </View>
    ) : (
      <View style={styles.elegido}>
        {archivo.mimeType.startsWith('image/') && <Image source={{ uri: archivo.uri }} style={styles.preview} resizeMode="cover" />}
        <View style={styles.fila}>
          <Text style={styles.nombre} numberOfLines={1}>📄 {archivo.name}</Text>
          <PressableScale onPress={onQuitar} hitSlop={10}><Text style={styles.quitar}>✕</Text></PressableScale>
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
  boton: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: brandTints.surfaceMuted, borderWidth: 1.5, borderColor: brandTints.border },
  botonTxt: { fontSize: 13, fontWeight: '700', color: brandColors.primaryDark },
  elegido: { gap: 8 },
  preview: { width: '100%', height: 160, borderRadius: 10, backgroundColor: brandTints.surfaceMuted },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  nombre: { flex: 1, fontSize: 13, color: brandColors.primaryDark, fontWeight: '600' },
  quitar: { fontSize: 18, fontWeight: '800', color: brandColors.error },
  hint: { fontSize: 11, color: brandTints.textMuted },
});