import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontSize, fontWeight, iconSize, radius, space, surface, textColors } from '@/constants/theme';
import { folioDe, formatFecha, money } from '@/shared/utils/format';
import { EstadoBadge } from './EstadoBadge';
import type { Etapa } from '../utils/etapasPedido';
import type { Pedido } from '../models/Pedido';

interface Props {
  pedido: Pedido;
  etapas: Etapa[];
  progreso: number; // 0..1
  cancelado: boolean;
}

// Encabezado del detalle: folio, estado, barra de avance y "Paso X de 7".
export const ProgresoPedido = ({ pedido, etapas, progreso, cancelado }: Props) => {
  const ancho = useRef(new Animated.Value(0)).current;
  const actual = etapas.find((e) => e.estado === 'actual');
  const completadas = etapas.filter((e) => e.estado === 'completada').length;
  const piezas = pedido.detalles.reduce((s, d) => s + d.cantidad, 0);
  // Solo cuentan los pagos que el admin ya aprobó
  const pagado = pedido.pagos.filter((x) => x.estado_pago === 'APROBADO').reduce((s, x) => s + x.monto, 0);
  const porPagar = Math.max(pedido.total_general - pagado, 0);

  useEffect(() => {
    Animated.timing(ancho, { toValue: progreso, duration: 700, useNativeDriver: false }).start();
  }, [progreso, ancho]);

  const texto = cancelado
    ? 'Este pedido fue cancelado'
    : actual
      ? `Paso ${actual.numero} de ${etapas.length} · ${actual.titulo}`
      : 'Pedido completado';

  return (
    <View style={styles.card}>
      <View style={styles.fila}>
        <View style={{ flex: 1 }}>
          <Text style={styles.etiqueta}>Pedido</Text>
          <Text style={styles.folio}>{folioDe(pedido.id)}</Text>
          <View style={styles.meta}>
            <Ionicons name="calendar-outline" size={iconSize.sm} color={textColors.muted} />
            <Text style={styles.metaTxt}>{formatFecha(pedido.fecha_pedido)}</Text>
            <Text style={styles.punto}>•</Text>
            <Ionicons name="pricetags-outline" size={iconSize.sm} color={textColors.muted} />
            <Text style={styles.metaTxt}>{piezas} {piezas === 1 ? 'pieza' : 'piezas'}</Text>
          </View>
        </View>
        <EstadoBadge estado={pedido.estado} />
      </View>

      <View>
        <View style={styles.filaPaso}>
          <Text style={[styles.paso, cancelado && { color: brandColors.error }]} numberOfLines={1}>
            {texto}
          </Text>
          <Text style={styles.contador}>{completadas}/{etapas.length}</Text>
        </View>
        <View style={styles.pista}>
          <Animated.View
            style={[
              styles.relleno,
              cancelado && { backgroundColor: brandColors.error },
              { width: ancho.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
            ]}
          />
        </View>
      </View>

      <View style={styles.totales}>
        <View style={styles.totalCaja}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>{money(pedido.total_general)}</Text>
        </View>
        <View style={styles.divisor} />
        <View style={styles.totalCaja}>
          <Text style={styles.totalLabel}>Pagado</Text>
          <Text style={styles.totalValor}>{money(pagado)}</Text>
        </View>
        <View style={styles.divisor} />
        <View style={styles.totalCaja}>
          <Text style={styles.totalLabel}>Por pagar</Text>
          <Text style={[styles.totalValor, { color: brandColors.primary }]}>{money(porPagar)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface.card, borderRadius: radius.lg, padding: space.lg, gap: space.lg,
    borderWidth: 1, borderColor: surface.border,
  },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space.sm },
  etiqueta: { fontSize: fontSize.caption, color: textColors.muted, fontWeight: fontWeight.medium },
  folio: { fontSize: fontSize.headline, fontWeight: fontWeight.bold, color: textColors.primary, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: space.xs },
  metaTxt: { fontSize: fontSize.small, color: textColors.muted },
  punto: { color: textColors.muted, marginHorizontal: 2 },
  filaPaso: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  paso: { flex: 1, fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: textColors.primary },
  contador: { fontSize: fontSize.small, fontWeight: fontWeight.semibold, color: textColors.muted },
  pista: { height: 8, borderRadius: radius.pill, backgroundColor: surface.muted, overflow: 'hidden' },
  relleno: { height: '100%', borderRadius: radius.pill, backgroundColor: brandColors.accent },
  totales: {
    flexDirection: 'row', backgroundColor: surface.muted, borderRadius: radius.md, paddingVertical: space.md,
  },
  totalCaja: { flex: 1, alignItems: 'center' },
  divisor: { width: 1, backgroundColor: surface.border },
  totalLabel: { fontSize: fontSize.caption, color: textColors.muted },
  totalValor: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, color: textColors.primary, marginTop: 2 },
});