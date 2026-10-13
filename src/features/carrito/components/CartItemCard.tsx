import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';
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

export const CartItemCard = ({ item, index, ocupado, onMas, onMenos, onEliminar }: Props) => (
  <FadeInView delay={Math.min(index, 6) * 60} style={[styles.card, ocupado && styles.ocupado]}>
    <Image
      source={{ uri: item.imagen_url || 'https://placehold.co/200x200?text=Sin+imagen' }}
      style={styles.imagen}
      resizeMode="cover"
    />

    <View style={styles.info}>
      <Text style={styles.nombre} numberOfLines={2}>
        {item.producto_nombre}
      </Text>
      <Text style={styles.detalle}>Color: {item.color || 'N/A'}</Text>
      <Text style={styles.detalle}>Unitario: ${item.precio_unitario.toFixed(2)}</Text>

      <View style={styles.fila}>
        <View style={styles.contador}>
          <PressableScale
            style={[styles.botonContador, item.cantidad <= 1 && styles.botonDeshabilitado]}
            onPress={onMenos}
            disabled={ocupado || item.cantidad <= 1}
            scaleTo={0.85}
            accessibilityLabel="Quitar uno"
          >
            <Text style={styles.botonContadorTexto}>−</Text>
          </PressableScale>
          <Text style={styles.cantidad}>{item.cantidad}</Text>
          <PressableScale
            style={styles.botonContador}
            onPress={onMas}
            disabled={ocupado}
            scaleTo={0.85}
            accessibilityLabel="Agregar uno"
          >
            <Text style={styles.botonContadorTexto}>+</Text>
          </PressableScale>
        </View>

        <Text style={styles.subtotal}>${item.subtotal.toFixed(2)}</Text>
      </View>

      <PressableScale style={styles.eliminar} onPress={onEliminar} scaleTo={0.94} hitSlop={8}>
        <Text style={styles.eliminarTexto}>🗑️ Eliminar</Text>
      </PressableScale>
    </View>
  </FadeInView>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: brandColors.white,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  ocupado: { opacity: 0.6 },
  imagen: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: brandTints.surfaceMuted,
  },
  info: { flex: 1 },
  nombre: { fontSize: 15, fontWeight: '800', color: brandColors.primaryDark },
  detalle: { fontSize: 12, color: brandTints.textMuted, marginTop: 2 },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  contador: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  botonContador: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: brandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonDeshabilitado: { opacity: 0.35 },
  botonContadorTexto: { color: brandColors.white, fontSize: 18, fontWeight: '700', lineHeight: 20 },
  cantidad: { fontSize: 15, fontWeight: '800', color: brandColors.primaryDark, minWidth: 22, textAlign: 'center' },
  subtotal: { fontSize: 15, fontWeight: '800', color: brandColors.primary },
  eliminar: { alignSelf: 'flex-start', marginTop: 10 },
  eliminarTexto: { fontSize: 12, fontWeight: '700', color: brandColors.error },
});