import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PressableScale } from '@/shared/components/PressableScale';
import { CustomInput } from '@/shared/components/CustomInput';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { brandColors, brandTints } from '@/constants/brand';
import type { PedidoItem } from '@/features/pedidos/models/Pedido';
import type { ArchivoDiseno } from '../models/Diseno';

interface Props {
  producto: PedidoItem;
  archivo: ArchivoDiseno | null;
  notas: string;
  onNotas: (texto: string) => void;
  onGaleria: () => void;
  onArchivo: () => void;
  onQuitar: () => void;
}

export const DisenoProductoCard = ({ producto, archivo, notas, onNotas, onGaleria, onArchivo, onQuitar }: Props) => (
  <View style={styles.caja}>
    <View style={styles.producto}>
      <Image
        source={{ uri: resolveImageUrl(producto.imagen_url) || 'https://placehold.co/100x100?text=-' }}
        style={styles.img}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre} numberOfLines={2}>{producto.producto_nombre}</Text>
        <Text style={styles.detalle}>
          {producto.color ? `${producto.color} · ` : ''}{producto.cantidad} pieza(s)
        </Text>
      </View>
      <Text style={archivo ? styles.listo : styles.pendiente}>{archivo ? '✅ Listo' : 'Falta'}</Text>
    </View>

    {!archivo ? (
      <View style={styles.botones}>
        <PressableScale style={styles.boton} onPress={onGaleria}><Text style={styles.botonTxt}>🖼️ Galería</Text></PressableScale>
        <PressableScale style={styles.boton} onPress={onArchivo}><Text style={styles.botonTxt}>📎 PDF / archivo</Text></PressableScale>
      </View>
    ) : (
      <View style={{ gap: 8 }}>
        {archivo.mimeType.startsWith('image/') && (
          <Image source={{ uri: archivo.uri }} style={styles.preview} resizeMode="cover" />
        )}
        <View style={styles.fila}>
          <Text style={styles.archivoNombre} numberOfLines={1}>📄 {archivo.name}</Text>
          <PressableScale onPress={onQuitar} hitSlop={10}><Text style={styles.quitar}>✕</Text></PressableScale>
        </View>
      </View>
    )}

    <CustomInput
      label="¿Cómo lo quieres? (opcional)"
      value={notas}
      onChangeText={onNotas}
      placeholder="Colores, posición, texto, tamaño…"
      multiline
    />
  </View>
);

const styles = StyleSheet.create({
  caja: { backgroundColor: brandColors.white, borderRadius: 14, padding: 14, gap: 12 },
  producto: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  img: { width: 48, height: 48, borderRadius: 8, backgroundColor: brandTints.surfaceMuted },
  nombre: { fontSize: 14, fontWeight: '800', color: brandColors.primaryDark },
  detalle: { fontSize: 12, color: brandTints.textMuted, marginTop: 1 },
  listo: { fontSize: 12, fontWeight: '800', color: brandColors.primary },
  pendiente: { fontSize: 12, fontWeight: '800', color: brandColors.error },
  botones: { flexDirection: 'row', gap: 10 },
  boton: {
    flex: 1, padding: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: brandTints.surfaceMuted, borderWidth: 1.5, borderColor: brandTints.border,
  },
  botonTxt: { fontSize: 13, fontWeight: '700', color: brandColors.primaryDark },
  preview: { width: '100%', height: 160, borderRadius: 10, backgroundColor: brandTints.surfaceMuted },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  archivoNombre: { flex: 1, fontSize: 13, color: brandColors.primaryDark, fontWeight: '600' },
  quitar: { fontSize: 18, fontWeight: '800', color: brandColors.error },
});