import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontSize, fontWeight, iconSize, radius, space, surface, textColors } from '@/constants/theme';
import { folioDe, money } from '@/shared/utils/format';

interface Props { pedidoId: number; total: number; pagado: number; pendiente: number }

// Resumen de cuánto lleva pagado y cuánto falta.
export const ResumenSaldoCard = ({ pedidoId, total, pagado, pendiente }: Props) => (
  <View style={styles.card}>
    <View style={styles.fila}>
      <View style={styles.iconoCaja}>
        <Ionicons name="cash-outline" size={iconSize.lg} color={brandColors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.etiqueta}>Pago final · {folioDe(pedidoId)}</Text>
        <Text style={styles.titulo}>Tu pedido está listo</Text>
      </View>
    </View>

    <View style={styles.montoCaja}>
      <Text style={styles.montoLabel}>Monto a pagar</Text>
      <Text style={styles.monto}>{money(pendiente)}</Text>
      <Text style={styles.moneda}>MXN · saldo restante</Text>
    </View>

    <View style={styles.desglose}>
      <View style={styles.renglon}>
        <Text style={styles.label}>Total del pedido</Text>
        <Text style={styles.valor}>{money(total)}</Text>
      </View>
      <View style={styles.renglon}>
        <View style={styles.conIcono}>
          <Ionicons name="checkmark-circle" size={iconSize.sm} color="#166534" />
          <Text style={styles.label}>Ya pagaste (anticipo)</Text>
        </View>
        <Text style={styles.valor}>− {money(pagado)}</Text>
      </View>
      <View style={styles.linea} />
      <View style={styles.renglon}>
        <Text style={styles.labelFuerte}>Por pagar</Text>
        <Text style={styles.valorFuerte}>{money(pendiente)}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface.card, borderRadius: radius.lg, padding: space.lg, gap: space.lg,
    borderWidth: 1, borderColor: surface.border,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  iconoCaja: {
    width: 44, height: 44, borderRadius: radius.md, backgroundColor: '#E6F2EF',
    alignItems: 'center', justifyContent: 'center',
  },
  etiqueta: { fontSize: fontSize.caption, color: textColors.muted, fontWeight: fontWeight.medium },
  titulo: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: textColors.primary, marginTop: 2 },
  montoCaja: { alignItems: 'center', backgroundColor: surface.muted, borderRadius: radius.md, paddingVertical: space.lg },
  montoLabel: { fontSize: fontSize.small, color: textColors.secondary },
  monto: { fontSize: 32, fontWeight: fontWeight.bold, color: textColors.primary, marginTop: 2 },
  moneda: { fontSize: fontSize.caption, color: textColors.muted },
  desglose: { gap: space.sm },
  renglon: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  conIcono: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  label: { fontSize: fontSize.body, color: textColors.secondary },
  valor: { fontSize: fontSize.body, fontWeight: fontWeight.medium, color: textColors.primary },
  linea: { height: 1, backgroundColor: surface.border },
  labelFuerte: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: textColors.primary },
  valorFuerte: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, color: brandColors.primary },
});