import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { PastillaAdmin } from '@/shared/components/admin';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { TIENDA_FISICA, colorEstadoPago, formatFecha, formatMoney, textoTipoPago } from '../utils/pedidoAdminUtils';
import type { PagoAdmin } from '../models/PedidoAdmin';

interface Props {
  pago: PagoAdmin;
  nota: string;
  onNota: (texto: string) => void;
  onVer: () => void;
  onAprobar: () => void;
  onRechazar: () => void;
  trabajando: boolean;
  ultimo: boolean;
}

const ESCALA = 1.15;

// Un pago del pedido. Si está por revisar, muestra el motivo y los botones Aprobar / Rechazar.
export const PagoAdminItem = ({ pago, nota, onNota, onVer, onAprobar, onRechazar, trabajando, ultimo }: Props) => {
  const c = colorEstadoPago(pago.estado_pago);
  const enTienda = pago.comprobante_url === TIENDA_FISICA;
  const porRevisar = pago.estado_pago === 'PENDIENTE';
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={[styles.item, !ultimo && styles.linea, porRevisar && styles.itemRevisar]}>
      <View style={styles.fila}>
        <View style={[styles.icono, { backgroundColor: c.bg }]}>
          <Ionicons name={enTienda ? 'storefront-outline' : 'document-text-outline'} size={19} color={c.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipo} maxFontSizeMultiplier={ESCALA}>{textoTipoPago(pago.tipo_pago)}</Text>
          <Text style={styles.fecha} maxFontSizeMultiplier={ESCALA}>{formatFecha(pago.fecha_pago, true)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={styles.monto} maxFontSizeMultiplier={ESCALA}>{formatMoney(pago.monto)}</Text>
          <PastillaAdmin texto={c.texto} icono={c.icono} bg={c.bg} fg={c.fg} />
        </View>
      </View>

      {enTienda ? (
        <View style={styles.info}>
          <Ionicons name="storefront-outline" size={15} color={textColors.secondary} />
          <Text style={styles.infoTexto} maxFontSizeMultiplier={ESCALA}>Paga en tienda física (sin comprobante)</Text>
        </View>
      ) : (
        !!pago.comprobante_url && (
          <PressableScale style={styles.ver} onPress={onVer} scaleTo={0.97}>
            <Ionicons name="eye-outline" size={17} color={textColors.primary} />
            <Text style={styles.verTexto} maxFontSizeMultiplier={ESCALA}>Ver comprobante</Text>
          </PressableScale>
        )
      )}

      {!!pago.notas_admin && !porRevisar && (
        <View style={styles.info}>
          <Ionicons name="chatbox-ellipses-outline" size={15} color={textColors.secondary} />
          <Text style={styles.infoTexto} maxFontSizeMultiplier={ESCALA}>{pago.notas_admin}</Text>
        </View>
      )}

      {porRevisar && (
        <View style={styles.revision}>
          <TextInput
            style={[styles.input, enfocado && styles.inputEnfocado]}
            placeholder="Motivo (obligatorio si lo rechazas)"
            placeholderTextColor={textColors.muted}
            value={nota}
            onChangeText={onNota}
            onFocus={() => setEnfocado(true)}
            onBlur={() => setEnfocado(false)}
            editable={!trabajando}
            multiline
            maxFontSizeMultiplier={ESCALA}
          />
          <View style={styles.botones}>
            <PressableScale style={[styles.boton, styles.rechazar]} onPress={onRechazar} disabled={trabajando} scaleTo={0.97}>
              <Ionicons name="close" size={18} color={brandColors.error} />
              <Text style={[styles.botonTexto, { color: brandColors.error }]} maxFontSizeMultiplier={ESCALA}>Rechazar</Text>
            </PressableScale>
            <PressableScale style={[styles.boton, styles.aprobar]} onPress={onAprobar} disabled={trabajando} scaleTo={0.97}>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={[styles.botonTexto, { color: '#FFFFFF' }]} maxFontSizeMultiplier={ESCALA}>Aprobar</Text>
            </PressableScale>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  item: { gap: 10, paddingVertical: space.md },
  itemRevisar: { backgroundColor: '#FFFBEB', marginHorizontal: -space.lg, paddingHorizontal: space.lg },
  linea: { borderBottomWidth: 1, borderBottomColor: surface.muted },
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icono: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tipo: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  fecha: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
  monto: { fontFamily: fontFamily.bold, fontSize: 16, color: textColors.primary },
  ver: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: surface.border,
    backgroundColor: surface.card,
  },
  verTexto: { fontFamily: fontFamily.semibold, fontSize: 14, color: textColors.primary },
  info: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  infoTexto: { flex: 1, fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
  revision: { gap: space.sm },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: surface.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    backgroundColor: surface.card,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: textColors.primary,
  },
  inputEnfocado: { borderColor: brandColors.primary, borderWidth: 1.5 },
  botones: { flexDirection: 'row', gap: space.sm },
  boton: { flex: 1, height: 44, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  rechazar: { borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FFFFFF' },
  aprobar: { backgroundColor: brandColors.primary },
  botonTexto: { fontFamily: fontFamily.semibold, fontSize: 15 },
});
