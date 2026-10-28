import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontSize, fontWeight, iconSize, radius, space, surface, textColors } from '@/constants/theme';
import { PressableScale } from '@/shared/components/PressableScale';
import type { ArchivoComprobante } from '../models/PagoFinal';

interface Props {
  archivo: ArchivoComprobante | null;
  onGaleria: () => void;
  onArchivo: () => void;
  onQuitar: () => void;
}

// Elegir la foto o PDF del comprobante y ver una vista previa.
export const SelectorComprobante = ({ archivo, onGaleria, onArchivo, onQuitar }: Props) => (
  <View style={styles.card}>
    <Text style={styles.titulo}>Comprobante de pago</Text>
    <Text style={styles.sub}>Sube la foto o el PDF de tu transferencia o depósito.</Text>

    {!archivo ? (
      <View style={styles.opciones}>
        <Opcion icono="images-outline" texto="Galería" onPress={onGaleria} />
        <Opcion icono="document-attach-outline" texto="PDF / archivo" onPress={onArchivo} />
      </View>
    ) : (
      <View style={styles.elegido}>
        {archivo.mimeType.startsWith('image/') ? (
          <Image source={{ uri: archivo.uri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.pdf}>
            <Ionicons name="document-text-outline" size={36} color={brandColors.primary} />
          </View>
        )}
        <View style={styles.filaArchivo}>
          <Ionicons name="checkmark-circle" size={iconSize.md} color="#166534" />
          <Text style={styles.nombre} numberOfLines={1}>{archivo.name}</Text>
          <PressableScale onPress={onQuitar} hitSlop={10} accessibilityLabel="Quitar archivo">
            <Ionicons name="trash-outline" size={iconSize.md} color={brandColors.error} />
          </PressableScale>
        </View>
      </View>
    )}

    <Text style={styles.hint}>JPG, PNG o PDF · máximo 5 MB</Text>
  </View>
);

const Opcion = ({ icono, texto, onPress }: { icono: 'images-outline' | 'document-attach-outline'; texto: string; onPress: () => void }) => (
  <PressableScale style={styles.opcion} onPress={onPress} accessibilityRole="button">
    <Ionicons name={icono} size={iconSize.lg} color={brandColors.primary} />
    <Text style={styles.opcionTxt}>{texto}</Text>
  </PressableScale>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface.card, borderRadius: radius.lg, padding: space.lg, gap: space.sm,
    borderWidth: 1, borderColor: surface.border,
  },
  titulo: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, color: textColors.primary },
  sub: { fontSize: fontSize.small, color: textColors.secondary },
  opciones: { flexDirection: 'row', gap: space.md, marginTop: space.xs },
  opcion: {
    flex: 1, alignItems: 'center', gap: space.xs, paddingVertical: space.lg,
    borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: surface.border,
    backgroundColor: surface.muted,
  },
  opcionTxt: { fontSize: fontSize.small, fontWeight: fontWeight.semibold, color: textColors.primary },
  elegido: { gap: space.sm, marginTop: space.xs },
  preview: { width: '100%', height: 180, borderRadius: radius.md, backgroundColor: surface.muted },
  pdf: {
    height: 90, borderRadius: radius.md, backgroundColor: surface.muted,
    alignItems: 'center', justifyContent: 'center',
  },
  filaArchivo: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  nombre: { flex: 1, fontSize: fontSize.small, fontWeight: fontWeight.medium, color: textColors.primary },
  hint: { fontSize: fontSize.caption, color: textColors.muted },
});