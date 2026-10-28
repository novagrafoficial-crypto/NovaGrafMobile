import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import type { CartItem } from '../models/CartItem';

interface Props {
  item: CartItem;
  index: number;
  /** true mientras se actualiza este renglón (desactiva los botones). */
  ocupado: boolean;
  onMas: () => void;
  onMenos: () => void;
  onEliminar: () => void;
}

const ESCALA = 1.15;

export const CartItemCard = ({ item, index, ocupado, onMas, onMenos, onEliminar }: Props) => {
  const conDescuento = item.precio_original > item.precio_unitario;
  return (
  <FadeInView delay={Math.min(index, 6) * 60} style={[styles.card, ocupado && styles.ocupado]}>
    {/* Foto */}
    <View style={styles.imagenBox}>
      {item.imagen_url ? (
        <Image
          source={{ uri: item.imagen_url }}
          style={styles.imagen}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={String(item.detalle_id)}
        />
      ) : (
        <Ionicons name="image-outline" size={28} color={textColors.muted} />
      )}
    </View>

    <View style={styles.info}>
      {/* Nombre + botón eliminar */}
      <View style={styles.filaTop}>
        <Text style={styles.nombre} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>
          {item.producto_nombre}
        </Text>
        <PressableScale
          style={styles.eliminar}
          onPress={onEliminar}
          disabled={ocupado}
          scaleTo={0.88}
          hitSlop={6}
          accessibilityLabel={`Eliminar ${item.producto_nombre}`}
        >
          <Ionicons name="trash-outline" size={18} color={brandColors.error} />
        </PressableScale>
      </View>

      {/* Color y precio unitario */}
      <View style={styles.filaDetalle}>
        {!!item.color && (
          <View style={styles.chip}>
            <Text style={styles.chipTexto} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{item.color}</Text>
          </View>
        )}
        <Text style={styles.unitario} maxFontSizeMultiplier={ESCALA}>${item.precio_unitario.toFixed(2)} c/u</Text>
        {conDescuento && (
          <Text style={styles.tachado} maxFontSizeMultiplier={ESCALA}>${item.precio_original.toFixed(2)}</Text>
        )}
      </View>

      {/* Oferta aplicada */}
      {conDescuento && (
        <View style={styles.oferta}>
          <Ionicons name="pricetag" size={12} color="#166534" />
          <Text style={styles.ofertaTexto} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>
            {item.descuento_nombre} · Ahorras ${item.ahorro.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Oferta que todavía no aplica: le faltan piezas */}
      {!conDescuento && !!item.descuento_pendiente && (
        <View style={styles.pendiente}>
          <Ionicons name="information-circle-outline" size={14} color="#B45309" />
          <Text style={styles.pendienteTexto} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>
            Agrega {item.descuento_pendiente.faltan} más para la oferta "{item.descuento_pendiente.nombre}"
          </Text>
        </View>
      )}

      {/* Cantidad + subtotal */}
      <View style={styles.filaAbajo}>
        <View style={styles.contador}>
          <PressableScale
            style={[styles.botonContador, item.cantidad <= 1 && styles.botonDeshabilitado]}
            onPress={onMenos}
            disabled={ocupado || item.cantidad <= 1}
            scaleTo={0.85}
            hitSlop={4}
            accessibilityLabel="Quitar uno"
          >
            <Ionicons name="remove" size={16} color={textColors.primary} />
          </PressableScale>
          <Text style={styles.cantidad} maxFontSizeMultiplier={ESCALA}>{item.cantidad}</Text>
          <PressableScale
            style={styles.botonContador}
            onPress={onMas}
            disabled={ocupado}
            scaleTo={0.85}
            hitSlop={4}
            accessibilityLabel="Agregar uno"
          >
            <Ionicons name="add" size={16} color={textColors.primary} />
          </PressableScale>
        </View>

        <Text style={styles.subtotal} maxFontSizeMultiplier={ESCALA}>${item.subtotal.toFixed(2)}</Text>
      </View>
    </View>
  </FadeInView>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.md,
    borderWidth: 1,
    borderColor: surface.border,
  },
  ocupado: { opacity: 0.55 },

  imagenBox: {
    width: 92,
    height: 92,
    borderRadius: radius.md,
    backgroundColor: surface.muted,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagen: { width: '100%', height: '100%' },

  info: { flex: 1, justifyContent: 'space-between' },
  filaTop: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  nombre: { flex: 1, fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 20, color: textColors.primary },
  eliminar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filaDetalle: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 4 },
  chip: {
    maxWidth: '55%',
    backgroundColor: surface.muted,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipTexto: { fontFamily: fontFamily.medium, fontSize: 12, color: textColors.primary },
  unitario: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
  tachado: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted, textDecorationLine: 'line-through' },
  oferta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: '#DCFCE7',
    maxWidth: '100%',
  },
  ofertaTexto: { flexShrink: 1, fontFamily: fontFamily.medium, fontSize: 12, color: '#166534' },
  pendiente: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 6 },
  pendienteTexto: { flex: 1, fontFamily: fontFamily.regular, fontSize: 12, color: '#B45309' },

  filaAbajo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm },
  contador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: surface.border,
    borderRadius: radius.pill,
    padding: 3,
  },
  botonContador: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: surface.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonDeshabilitado: { opacity: 0.35 },
  cantidad: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary, minWidth: 24, textAlign: 'center' },
  subtotal: { fontFamily: fontFamily.bold, fontSize: 17, color: textColors.primary },
});