import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontSize, fontWeight, iconSize, radius, space, surface, textColors } from '@/constants/theme';
import { folioDe, money } from '@/shared/utils/format';
import type { MetodoPagoDetalle, ModoPago } from '../models/PagoFinal';

interface Props {
  metodo: MetodoPagoDetalle | null;
  modo: ModoPago;
  pedidoId: number;
  cliente: string;
  monto: number;
}

const TITULO: Record<ModoPago, string> = {
  TRANSFERENCIA: 'Transferencia bancaria',
  DEPOSITO: 'Depósito bancario',
  TIENDA: 'Pago en tienda',
};

// Datos para realizar el pago final (cuenta bancaria o ticket de tienda).
export const DatosPagoCard = ({ metodo, modo, pedidoId, cliente, monto }: Props) => {
  const esTienda = modo === 'TIENDA';
  const datos = metodo?.datos ?? [];

  return (
    <View style={[styles.card, esTienda && styles.ticket]}>
      <View style={styles.cabecera}>
        <Ionicons
          name={esTienda ? 'storefront-outline' : 'business-outline'}
          size={iconSize.md}
          color={brandColors.primary}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>{TITULO[modo]}</Text>
          {!!metodo?.nombre && <Text style={styles.sub}>{metodo.nombre}</Text>}
        </View>
      </View>

      {!!metodo?.instrucciones && (
        <View style={styles.instrucciones}>
          <Ionicons name="information-circle-outline" size={iconSize.sm} color={textColors.secondary} />
          <Text style={styles.instruccionesTxt}>{metodo.instrucciones}</Text>
        </View>
      )}

      {esTienda && (
        <>
          <Row etiqueta="Folio" valor={folioDe(pedidoId)} grande />
          <Row etiqueta="Cliente" valor={cliente} />
        </>
      )}

      {datos.length === 0 && !esTienda ? (
        <Text style={styles.vacio}>Aún no hay datos bancarios configurados. Escríbenos por el chat del pedido.</Text>
      ) : (
        datos.map((d) => <Row key={d.etiqueta} etiqueta={d.etiqueta} valor={d.valor} />)
      )}

      {!esTienda && <Row etiqueta="Referencia / concepto" valor={folioDe(pedidoId)} />}

      <View style={styles.monto}>
        <Text style={styles.montoLabel}>{esTienda ? 'Paga en tienda' : 'Transfiere exactamente'}</Text>
        <Text style={styles.montoValor}>{money(monto)} MXN</Text>
      </View>

      <View style={styles.hint}>
        <Ionicons name={esTienda ? 'phone-portrait-outline' : 'copy-outline'} size={14} color={textColors.muted} />
        <Text style={styles.hintTxt}>
          {esTienda ? 'Muestra esta pantalla al momento de pagar.' : 'Mantén presionado un dato para copiarlo.'}
        </Text>
      </View>
    </View>
  );
};

const Row = ({ etiqueta, valor, grande }: { etiqueta: string; valor: string; grande?: boolean }) => (
  <View style={styles.row}>
    <Text style={styles.etiqueta}>{etiqueta}</Text>
    <Text style={[styles.valor, grande && styles.valorGrande]} selectable>{valor}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface.card, borderRadius: radius.lg, padding: space.lg, gap: space.md,
    borderWidth: 1, borderColor: surface.border,
  },
  ticket: { borderStyle: 'dashed', borderWidth: 1.5 },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  titulo: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, color: textColors.primary },
  sub: { fontSize: fontSize.small, color: textColors.muted, marginTop: 1 },
  instrucciones: {
    flexDirection: 'row', gap: space.sm, backgroundColor: surface.muted,
    borderRadius: radius.sm, padding: space.md,
  },
  instruccionesTxt: { flex: 1, fontSize: fontSize.small, color: textColors.secondary, lineHeight: 19 },
  vacio: { fontSize: fontSize.small, color: textColors.secondary },
  row: { gap: 2, paddingBottom: space.sm, borderBottomWidth: 1, borderBottomColor: surface.muted },
  etiqueta: { fontSize: fontSize.caption, color: textColors.muted, fontWeight: fontWeight.medium },
  valor: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.semibold, color: textColors.primary },
  valorGrande: { fontSize: fontSize.headline, letterSpacing: 1 },
  monto: { backgroundColor: '#E6F2EF', borderRadius: radius.md, padding: space.md, alignItems: 'center' },
  montoLabel: { fontSize: fontSize.small, color: brandColors.primary, fontWeight: fontWeight.medium },
  montoValor: { fontSize: 24, fontWeight: fontWeight.bold, color: textColors.primary, marginTop: 2 },
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
  hintTxt: { fontSize: fontSize.caption, color: textColors.muted },
});