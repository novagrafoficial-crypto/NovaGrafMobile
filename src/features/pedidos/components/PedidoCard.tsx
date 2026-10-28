import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { folioDe, formatFecha, money } from '@/shared/utils/format';
import { brandColors } from '@/constants/brand';
import { fontSize, fontWeight, iconSize, radius, space, surface, textColors } from '@/constants/theme';
import { EstadoBadge } from './EstadoBadge';
import { necesitaPago } from '../utils/pedidoUtils';
import { construirEtapas, esCancelado, progresoPedido } from '../utils/etapasPedido';
import type { Pedido } from '../models/Pedido';

interface Props { pedido: Pedido; index: number; onPress: () => void; onPagar: () => void }

export const PedidoCard = ({ pedido, index, onPress, onPagar }: Props) => {
  const piezas = pedido.detalles.reduce((s, d) => s + d.cantidad, 0);
  const etapas = construirEtapas(pedido);
  const actual = etapas.find((e) => e.estado === 'actual');
  const cancelado = esCancelado(pedido);
  const extra = pedido.detalles.length - 3;

  return (
    <FadeInView delay={Math.min(index, 6) * 60}>
      <PressableScale onPress={onPress} scaleTo={0.98} style={styles.card}>
        <View style={styles.fila}>
          <View>
            <Text style={styles.folio}>{folioDe(pedido.id)}</Text>
            <Text style={styles.fecha}>{formatFecha(pedido.fecha_pedido)}</Text>
          </View>
          <EstadoBadge estado={pedido.estado} />
        </View>

        <View style={styles.productos}>
          <View style={styles.miniaturas}>
            {pedido.detalles.slice(0, 3).map((d, i) => (
              <Image
                key={i}
                source={{ uri: resolveImageUrl(d.imagen_url) || 'https://placehold.co/100x100?text=-' }}
                style={[styles.mini, i > 0 && { marginLeft: -10 }]}
              />
            ))}
            {extra > 0 && (
              <View style={[styles.mini, styles.masMini]}>
                <Text style={styles.masTxt}>+{extra}</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.piezas}>{piezas} {piezas === 1 ? 'pieza' : 'piezas'}</Text>
            <Text style={styles.total}>{money(pedido.total_general)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={iconSize.md} color={textColors.muted} />
        </View>

        {/* Avance del flujo */}
        <View style={{ gap: space.sm }}>
          <View style={styles.pista}>
            <View
              style={[
                styles.relleno,
                { width: `${Math.round(progresoPedido(pedido) * 100)}%` },
                cancelado && { backgroundColor: brandColors.error },
              ]}
            />
          </View>
          <Text style={styles.paso} numberOfLines={1}>
            {cancelado
              ? 'Pedido cancelado'
              : actual
                ? `Paso ${actual.numero} de ${etapas.length} · ${actual.resumen}`
                : 'Pedido completado'}
          </Text>
        </View>

        {necesitaPago(pedido) && (
          <PressableScale onPress={onPagar} style={styles.pagar}>
            <Ionicons name="card-outline" size={iconSize.md} color={textColors.inverse} />
            <Text style={styles.pagarTxt}>Pagar anticipo · {money(pedido.monto_anticipo)}</Text>
          </PressableScale>
        )}
      </PressableScale>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface.card, borderRadius: radius.lg, padding: space.lg, gap: space.md,
    borderWidth: 1, borderColor: surface.border,
  },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  folio: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: textColors.primary },
  fecha: { fontSize: fontSize.small, color: textColors.muted, marginTop: 2 },
  productos: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  miniaturas: { flexDirection: 'row' },
  mini: {
    width: 46, height: 46, borderRadius: radius.sm, backgroundColor: surface.muted,
    borderWidth: 2, borderColor: surface.card,
  },
  masMini: { marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  masTxt: { fontSize: fontSize.small, fontWeight: fontWeight.bold, color: textColors.secondary },
  piezas: { fontSize: fontSize.small, color: textColors.muted },
  total: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: textColors.primary },
  pista: { height: 6, borderRadius: radius.pill, backgroundColor: surface.muted, overflow: 'hidden' },
  relleno: { height: '100%', borderRadius: radius.pill, backgroundColor: brandColors.accent },
  paso: { fontSize: fontSize.small, fontWeight: fontWeight.medium, color: textColors.secondary },
  pagar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm,
    backgroundColor: brandColors.primary, borderRadius: radius.md, paddingVertical: 13,
  },
  pagarTxt: { color: textColors.inverse, fontWeight: fontWeight.semibold, fontSize: fontSize.body },
});