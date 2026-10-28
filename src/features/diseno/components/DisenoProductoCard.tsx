import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { CustomInput } from '@/shared/components/CustomInput';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
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

const ESCALA = 1.15;

export const DisenoProductoCard = ({ producto, archivo, notas, onNotas, onGaleria, onArchivo, onQuitar }: Props) => {
  const imagenProducto = resolveImageUrl(producto.imagen_url);

  return (
    <View style={[styles.caja, !!archivo && styles.cajaLista]}>
      {/* Producto + estado */}
      <View style={styles.producto}>
        <View style={styles.imgBox}>
          {imagenProducto ? (
            <Image source={{ uri: imagenProducto }} style={styles.img} contentFit="cover" cachePolicy="memory-disk" />
          ) : (
            <Ionicons name="cube-outline" size={22} color={textColors.muted} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nombre} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>{producto.producto_nombre}</Text>
          <Text style={styles.detalle} maxFontSizeMultiplier={ESCALA}>
            {producto.color ? `${producto.color} · ` : ''}{producto.cantidad} {producto.cantidad === 1 ? 'pieza' : 'piezas'}
          </Text>
        </View>
        <View style={[styles.estado, archivo ? styles.estadoListo : styles.estadoFalta]}>
          <Ionicons
            name={archivo ? 'checkmark-circle' : 'ellipse-outline'}
            size={14}
            color={archivo ? '#166534' : '#92400E'}
          />
          <Text style={[styles.estadoTexto, { color: archivo ? '#166534' : '#92400E' }]} maxFontSizeMultiplier={1}>
            {archivo ? 'Listo' : 'Falta'}
          </Text>
        </View>
      </View>

      {/* Elegir archivo o ver el elegido */}
      {!archivo ? (
        <View style={styles.botones}>
          <PressableScale style={styles.boton} onPress={onGaleria} scaleTo={0.97} accessibilityRole="button">
            <Ionicons name="images-outline" size={24} color={textColors.primary} />
            <Text style={styles.botonTxt} maxFontSizeMultiplier={ESCALA}>Galería</Text>
          </PressableScale>
          <PressableScale style={styles.boton} onPress={onArchivo} scaleTo={0.97} accessibilityRole="button">
            <Ionicons name="document-attach-outline" size={24} color={textColors.primary} />
            <Text style={styles.botonTxt} maxFontSizeMultiplier={ESCALA}>PDF / archivo</Text>
          </PressableScale>
        </View>
      ) : (
        <View style={styles.elegido}>
          {archivo.mimeType.startsWith('image/') ? (
            <Image source={{ uri: archivo.uri }} style={styles.preview} contentFit="cover" />
          ) : (
            <View style={styles.pdf}>
              <Ionicons name="document-text-outline" size={36} color={textColors.primary} />
            </View>
          )}
          <View style={styles.fila}>
            <Ionicons name="attach" size={18} color={textColors.secondary} />
            <Text style={styles.archivoNombre} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{archivo.name}</Text>
            <PressableScale onPress={onQuitar} hitSlop={10} style={styles.quitar} accessibilityLabel="Quitar archivo">
              <Ionicons name="trash-outline" size={18} color={brandColors.error} />
            </PressableScale>
          </View>
        </View>
      )}

      <CustomInput
        label="¿Cómo lo quieres? (opcional)"
        value={notas}
        onChangeText={onNotas}
        placeholder="Colores, posición, texto o tamaño"
        multiline
      />
    </View>
  );
};

const styles = StyleSheet.create({
  caja: {
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
    borderWidth: 1,
    borderColor: surface.border,
  },
  cajaLista: { borderColor: '#86EFAC' }, // borde verde suave cuando ya tiene archivo

  producto: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  imgBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: surface.muted,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: '100%', height: '100%' },
  nombre: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 20, color: textColors.primary },
  detalle: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary, marginTop: 2 },

  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  estadoListo: { backgroundColor: '#DCFCE7' },
  estadoFalta: { backgroundColor: '#FEF3C7' },
  estadoTexto: { fontFamily: fontFamily.semibold, fontSize: 12 },

  botones: { flexDirection: 'row', gap: space.md },
  boton: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: space.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: surface.border,
    backgroundColor: surface.muted,
  },
  botonTxt: { fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },

  elegido: { gap: space.sm },
  preview: { width: '100%', height: 180, borderRadius: radius.md, backgroundColor: surface.muted },
  pdf: { height: 100, borderRadius: radius.md, backgroundColor: surface.muted, alignItems: 'center', justifyContent: 'center' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  archivoNombre: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },
  quitar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});