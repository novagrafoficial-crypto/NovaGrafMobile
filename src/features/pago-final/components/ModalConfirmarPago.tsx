import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { money } from '@/shared/utils/format';

interface Props {
  visible: boolean;
  esTienda: boolean;
  monto: number;
  /** Nombre del archivo elegido (solo transferencia/depósito) */
  archivo?: string | null;
  enviando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

// Confirmación con el diseño de la app (en lugar del Alert del sistema).
export const ModalConfirmarPago = ({ visible, esTienda, monto, archivo, enviando, onConfirmar, onCancelar }: Props) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
    <View style={styles.fondo}>
      <View style={styles.card}>
        <View style={styles.icono}>
          <Ionicons name={esTienda ? 'storefront-outline' : 'cloud-upload-outline'} size={28} color={brandColors.primary} />
        </View>

        <Text style={styles.titulo}>{esTienda ? 'Confirmar pago en tienda' : 'Enviar comprobante'}</Text>
        <Text style={styles.mensaje}>
          {esTienda ? 'Pagarás tu saldo directamente en la tienda.' : 'Revisaremos tu comprobante y te avisaremos.'}
        </Text>

        <View style={styles.detalle}>
          <View style={styles.fila}>
            <Text style={styles.label}>Monto</Text>
            <Text style={styles.valor}>{money(monto)} MXN</Text>
          </View>
          {!esTienda && !!archivo && (
            <View style={styles.fila}>
              <Text style={styles.label}>Archivo</Text>
              <Text style={[styles.valor, styles.archivo]} numberOfLines={1}>{archivo}</Text>
            </View>
          )}
        </View>

        <View style={styles.botones}>
          <PressableScale style={[styles.boton, styles.botonSecundario]} onPress={onCancelar} disabled={enviando}>
            <Text style={styles.textoSecundario}>Cancelar</Text>
          </PressableScale>
          <PressableScale
            style={[styles.boton, styles.botonPrincipal, enviando && { opacity: 0.6 }]}
            onPress={onConfirmar}
            disabled={enviando}
          >
            <Text style={styles.textoPrincipal}>{enviando ? 'Enviando…' : 'Confirmar'}</Text>
          </PressableScale>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: space.xl },
  card: { width: '100%', maxWidth: 360, backgroundColor: surface.card, borderRadius: radius.lg, padding: space.xl, alignItems: 'center', gap: space.sm },
  icono: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  titulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary, textAlign: 'center' },
  mensaje: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },
  detalle: { alignSelf: 'stretch', backgroundColor: surface.muted, borderRadius: radius.md, padding: space.md, gap: space.sm, marginTop: space.sm },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.md },
  label: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary },
  valor: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  archivo: { flex: 1, textAlign: 'right', fontSize: 13 },
  botones: { flexDirection: 'row', gap: space.sm, alignSelf: 'stretch', marginTop: space.md },
  boton: { flex: 1, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  botonSecundario: { borderWidth: 1, borderColor: surface.border },
  botonPrincipal: { backgroundColor: brandColors.primary },
  textoSecundario: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  textoPrincipal: { fontFamily: fontFamily.semibold, fontSize: 15, color: '#FFFFFF' },
});