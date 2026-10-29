import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { formatFecha, money } from '@/shared/utils/format';
import { brandColors } from '@/constants/brand';
import { fontSize, fontWeight, iconSize, radius, space, surface, textColors } from '@/constants/theme';
import { TIENDA_FISICA, esPdf } from '../utils/pedidoUtils';
import { ImagenAmpliable } from './ImagenAmpliable';
import type { IconoNombre } from '../utils/etapasPedido';
import type { PagoDelPedido } from '../models/Pedido';

interface Props { pago: PagoDelPedido; onAbrirUrl: (url: string) => void }

const ESTADO_PAGO: Record<string, { texto: string; icono: IconoNombre; color: string }> = {
  PENDIENTE: { texto: 'En verificación', icono: 'time-outline', color: '#92400E' },
  APROBADO: { texto: 'Aprobado', icono: 'checkmark-circle', color: '#166534' },
  RECHAZADO: { texto: 'Rechazado', icono: 'close-circle', color: brandColors.error },
};

export const ComprobanteItem = ({ pago, onAbrirUrl }: Props) => {
  const url = pago.comprobante_url;
  const enTienda = url === TIENDA_FISICA;
  const estado = ESTADO_PAGO[pago.estado_pago] ?? ESTADO_PAGO.PENDIENTE;
  const tipo = pago.tipo_pago === 'ANTICIPO' ? 'Anticipo' : 'Pago final';

  return (
    <View style={styles.card}>
      <View style={styles.fila}>
        <View>
          <Text style={styles.tipo}>{tipo}</Text>
          <Text style={styles.fecha}>{formatFecha(pago.fecha_pago)}</Text>
        </View>
        <Text style={styles.monto}>{money(pago.monto)}</Text>
      </View>

      <View style={styles.estado}>
        <Ionicons name={estado.icono} size={iconSize.sm} color={estado.color} />
        <Text style={[styles.estadoTxt, { color: estado.color }]}>{estado.texto}</Text>
      </View>

      {enTienda ? (
        <View style={styles.archivo}>
          <Ionicons name="storefront-outline" size={iconSize.md} color={brandColors.primary} />
          <Text style={styles.archivoTxt}>Pago en tienda física</Text>
        </View>
      ) : url && esPdf(url) ? (
        <PressableScale onPress={() => onAbrirUrl(url)} style={styles.archivo}>
          <Ionicons name="document-attach-outline" size={iconSize.md} color={brandColors.primary} />
          <Text style={styles.archivoTxt}>Abrir comprobante (PDF)</Text>
          <Ionicons name="open-outline" size={iconSize.sm} color={textColors.muted} />
        </PressableScale>
      ) : url ? (
        <ImagenAmpliable url={url} alto={150} />
      ) : null}

      {!!pago.notas_admin && (
        <View style={styles.nota}>
          <Ionicons name="information-circle-outline" size={iconSize.sm} color={textColors.secondary} />
          <Text style={styles.notaTxt}>{pago.notas_admin}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: surface.muted, borderRadius: radius.md, padding: space.md, gap: space.sm },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tipo: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: textColors.primary },
  fecha: { fontSize: fontSize.caption, color: textColors.muted, marginTop: 2 },
  monto: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, color: textColors.primary },
  estado: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  estadoTxt: { fontSize: fontSize.small, fontWeight: fontWeight.semibold },
  archivo: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    backgroundColor: surface.card, borderRadius: radius.sm, padding: space.md,
  },
  archivoTxt: { flex: 1, fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: textColors.primary },
  nota: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  notaTxt: { flex: 1, fontSize: fontSize.small, color: textColors.secondary, lineHeight: 19 },
});