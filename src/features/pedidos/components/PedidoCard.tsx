import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { folioDe, formatFecha, money } from '@/shared/utils/format';
import { brandColors, brandTints } from '@/constants/brand';
import { EstadoBadge } from './EstadoBadge';
import { necesitaPago } from '../utils/pedidoUtils';
import type { Pedido } from '../models/Pedido';

interface Props { pedido: Pedido; index: number; onPress: () => void; onPagar: () => void }

export const PedidoCard = ({ pedido, index, onPress, onPagar }: Props) => {
  const piezas = pedido.detalles.reduce((s, d) => s + d.cantidad, 0);
  const anticipo = pedido.pagos.find((p) => p.tipo_pago === 'ANTICIPO');

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

        <View style={styles.miniaturas}>
          {pedido.detalles.slice(0, 3).map((d, i) => (
            <Image
              key={i}
              source={{ uri: resolveImageUrl(d.imagen_url) || 'https://placehold.co/100x100?text=-' }}
              style={styles.mini}
            />
          ))}
          <Text style={styles.piezas}>{piezas} {piezas === 1 ? 'pieza' : 'piezas'}</Text>
          <Text style={styles.total}>{money(pedido.total_general)}</Text>
        </View>

        {necesitaPago(pedido) ? (
          <PressableScale onPress={onPagar} style={styles.pagar}>
            <Text style={styles.pagarTxt}>💳 Pagar anticipo · {money(pedido.monto_anticipo)}</Text>
          </PressableScale>
        ) : anticipo ? (
          <Text style={styles.pagoOk}>
            ✓ Anticipo {anticipo.comprobante_url === 'TIENDA_FISICA' ? 'en tienda' : 'con comprobante'} · {anticipo.estado_pago.toLowerCase()}
          </Text>
        ) : null}
      </PressableScale>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: brandColors.white, borderRadius: 16, padding: 14, gap: 12 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  folio: { fontSize: 16, fontWeight: '800', color: brandColors.primaryDark },
  fecha: { fontSize: 12, color: brandTints.textMuted, marginTop: 1 },
  miniaturas: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mini: { width: 44, height: 44, borderRadius: 8, backgroundColor: brandTints.surfaceMuted },
  piezas: { flex: 1, fontSize: 12, color: brandTints.textMuted, marginLeft: 4 },
  total: { fontSize: 16, fontWeight: '800', color: brandColors.primary },
  pagar: { backgroundColor: brandColors.primary, borderRadius: 10, padding: 11, alignItems: 'center' },
  pagarTxt: { color: brandColors.white, fontWeight: '700', fontSize: 13 },
  pagoOk: { fontSize: 12, fontWeight: '600', color: brandColors.primary },
});