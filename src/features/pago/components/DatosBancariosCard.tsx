import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { brandColors, brandTints } from '@/constants/brand';
import { folioDe, money } from '../utils/pagoUtils';
import type { DatoBancario } from '../models/Pago';

interface Props { datos: DatoBancario[]; monto: number; pedidoId: number }

// Mantén presionado un dato para copiarlo (selectable)
export const DatosBancariosCard = ({ datos, monto, pedidoId }: Props) => (
  <View style={styles.card}>
    <Text style={styles.titulo}>Datos para tu pago</Text>
    {datos.length === 0 ? (
      <Text style={styles.vacio}>Aún no hay datos bancarios configurados. Contáctanos por el chat.</Text>
    ) : (
      datos.map((d) => (
        <View key={d.etiqueta} style={styles.fila}>
          <Text style={styles.etiqueta}>{d.etiqueta}</Text>
          <Text style={styles.valor} selectable>{d.valor}</Text>
        </View>
      ))
    )}
    <View style={styles.fila}>
      <Text style={styles.etiqueta}>Referencia / concepto</Text>
      <Text style={styles.valor} selectable>{folioDe(pedidoId)}</Text>
    </View>
    <View style={styles.monto}>
      <Text style={styles.montoLabel}>Transfiere exactamente (anticipo 50%)</Text>
      <Text style={styles.montoValor}>{money(monto)} MXN</Text>
    </View>
    <Text style={styles.hint}>Mantén presionado un dato para copiarlo.</Text>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: brandColors.white, borderRadius: 14, padding: 14, gap: 8 },
  titulo: { fontSize: 15, fontWeight: '800', color: brandColors.primaryDark },
  vacio: { fontSize: 13, color: brandTints.textMuted },
  fila: { gap: 1 },
  etiqueta: { fontSize: 11, fontWeight: '700', color: brandTints.textMuted, textTransform: 'uppercase' },
  valor: { fontSize: 15, fontWeight: '700', color: brandColors.primaryDark },
  monto: { backgroundColor: brandTints.accentSoft, borderRadius: 12, padding: 12, marginTop: 4, alignItems: 'center' },
  montoLabel: { fontSize: 12, color: brandColors.primary, fontWeight: '600' },
  montoValor: { fontSize: 22, fontWeight: '800', color: brandColors.primary },
  hint: { fontSize: 11, color: brandTints.textMuted, textAlign: 'center' },
});