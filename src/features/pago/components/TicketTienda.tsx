import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { brandColors, brandTints } from '@/constants/brand';
import { folioDe, money } from '../utils/pagoUtils';
import type { DatoBancario, PedidoPago } from '../models/Pago';

interface Props { pedido: PedidoPago; cliente: string; metodoNombre: string; datos: DatoBancario[] }

export const TicketTienda = ({ pedido, cliente, metodoNombre, datos }: Props) => (
  <View style={styles.ticket}>
    <Text style={styles.eyebrow}>PAGO EN TIENDA · {metodoNombre}</Text>
    <Text style={styles.folio}>{folioDe(pedido.id)}</Text>
    <Text style={styles.cliente}>Cliente: {cliente}</Text>
    <Text style={styles.cliente}>Entrega: {pedido.metodo_entrega_nombre}</Text>

    <View style={styles.linea} />
    {pedido.detalles.map((d, i) => (
      <View key={i} style={styles.item}>
        <Text style={styles.itemTxt} numberOfLines={2}>
          {d.producto_nombre}{d.color ? ` (${d.color})` : ''} ×{d.cantidad}
        </Text>
        <Text style={styles.itemMonto}>{money(d.subtotal)}</Text>
      </View>
    ))}
    <View style={styles.linea} />

    <View style={styles.item}><Text style={styles.itemTxt}>Total</Text><Text style={styles.itemMonto}>{money(pedido.total_general)}</Text></View>
    <View style={styles.item}><Text style={styles.itemTxt}>Saldo restante</Text><Text style={styles.itemMonto}>{money(pedido.monto_restante)}</Text></View>
    <View style={styles.pagar}>
      <Text style={styles.pagarLabel}>Monto a pagar en tienda (50%)</Text>
      <Text style={styles.pagarValor}>{money(pedido.monto_anticipo)} MXN</Text>
    </View>

    {datos.map((d) => (
      <Text key={d.etiqueta} style={styles.extra}><Text style={styles.extraEt}>{d.etiqueta}: </Text>{d.valor}</Text>
    ))}
    <Text style={styles.nota}>Muestra este ticket en tu celular al momento de pagar.</Text>
  </View>
);

const styles = StyleSheet.create({
  ticket: { backgroundColor: brandColors.white, borderRadius: 14, padding: 16, gap: 4, borderWidth: 1.5, borderColor: brandTints.border, borderStyle: 'dashed' },
  eyebrow: { fontSize: 11, fontWeight: '800', color: brandColors.accent, textAlign: 'center' },
  folio: { fontSize: 26, fontWeight: '800', color: brandColors.primaryDark, textAlign: 'center', letterSpacing: 1 },
  cliente: { fontSize: 13, color: brandTints.textMuted, textAlign: 'center' },
  linea: { height: 1, backgroundColor: brandTints.border, marginVertical: 8 },
  item: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  itemTxt: { flex: 1, fontSize: 13, color: brandColors.primaryDark },
  itemMonto: { fontSize: 13, fontWeight: '700', color: brandColors.primaryDark },
  pagar: { backgroundColor: brandTints.accentSoft, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 8 },
  pagarLabel: { fontSize: 12, color: brandColors.primary, fontWeight: '600' },
  pagarValor: { fontSize: 22, fontWeight: '800', color: brandColors.primary },
  extra: { fontSize: 12, color: brandColors.primaryDark, marginTop: 4 },
  extraEt: { fontWeight: '700' },
  nota: { fontSize: 11, color: brandTints.textMuted, textAlign: 'center', marginTop: 8 },
});