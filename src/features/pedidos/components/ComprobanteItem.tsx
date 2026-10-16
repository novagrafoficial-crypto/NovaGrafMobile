import React, { useState } from 'react';
import { View, Text, Image, Modal, StyleSheet } from 'react-native';
import { PressableScale } from '@/shared/components/PressableScale';
import { formatFecha, money } from '@/shared/utils/format';
import { brandColors, brandTints } from '@/constants/brand';
import { TIENDA_FISICA, esPdf } from '../utils/pedidoUtils';
import type { PagoDelPedido } from '../models/Pedido';

interface Props { pago: PagoDelPedido; onAbrirUrl: (url: string) => void }

export const ComprobanteItem = ({ pago, onAbrirUrl }: Props) => {
  const [ampliada, setAmpliada] = useState(false);
  const url = pago.comprobante_url;
  const enTienda = url === TIENDA_FISICA;

  return (
    <View style={styles.card}>
      <View style={styles.fila}>
        <Text style={styles.tipo}>{pago.tipo_pago === 'ANTICIPO' ? 'Anticipo' : pago.tipo_pago.replace(/_/g, ' ')}</Text>
        <Text style={styles.monto}>{money(pago.monto)}</Text>
      </View>
      <Text style={styles.meta}>
        {pago.estado_pago.toLowerCase()} · {formatFecha(pago.fecha_pago)}
      </Text>

      {enTienda ? (
        <Text style={styles.tienda}>🏪 Pago en tienda física</Text>
      ) : url && esPdf(url) ? (
        <PressableScale onPress={() => onAbrirUrl(url)} style={styles.pdf}>
          <Text style={styles.pdfTxt}>📄 Abrir comprobante (PDF)</Text>
        </PressableScale>
      ) : url ? (
        <>
          <PressableScale onPress={() => setAmpliada(true)}>
            <Image source={{ uri: url }} style={styles.imagen} resizeMode="cover" />
            <Text style={styles.toca}>Toca para ampliar</Text>
          </PressableScale>
          <Modal visible={ampliada} transparent animationType="fade" onRequestClose={() => setAmpliada(false)}>
            <PressableScale scaleTo={1} onPress={() => setAmpliada(false)} style={styles.modal}>
              <Image source={{ uri: url }} style={styles.imagenGrande} resizeMode="contain" />
              <Text style={styles.cerrar}>Toca para cerrar</Text>
            </PressableScale>
          </Modal>
        </>
      ) : null}

      {!!pago.notas_admin && <Text style={styles.nota}>📝 {pago.notas_admin}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: brandTints.surfaceMuted, borderRadius: 12, padding: 12, gap: 6 },
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  tipo: { fontSize: 14, fontWeight: '800', color: brandColors.primaryDark },
  monto: { fontSize: 14, fontWeight: '800', color: brandColors.primary },
  meta: { fontSize: 12, color: brandTints.textMuted, textTransform: 'capitalize' },
  tienda: { fontSize: 13, fontWeight: '600', color: brandColors.primaryDark },
  pdf: { backgroundColor: brandColors.white, borderRadius: 10, padding: 10, alignItems: 'center' },
  pdfTxt: { fontSize: 13, fontWeight: '700', color: brandColors.primary },
  imagen: { width: '100%', height: 160, borderRadius: 10, backgroundColor: brandColors.white },
  toca: { fontSize: 11, color: brandTints.textMuted, textAlign: 'center', marginTop: 4 },
  nota: { fontSize: 12, color: brandColors.primaryDark },
  modal: { flex: 1, backgroundColor: brandTints.overlay, alignItems: 'center', justifyContent: 'center', padding: 16 },
  imagenGrande: { width: '100%', height: '80%' },
  cerrar: { color: brandColors.white, fontSize: 12, marginTop: 10 },
});