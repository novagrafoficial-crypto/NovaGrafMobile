import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { FadeInView } from '@/shared/components/FadeInView';
import { folioDe, money } from '@/shared/utils/format';
import type { PagoRegistrado } from '../models/PagoFinal';

interface Props { pedidoId: number; pago: PagoRegistrado | null }

const textoEstado = (estado: string | undefined) =>
  estado === 'APROBADO' ? 'Aprobado' : estado === 'RECHAZADO' ? 'Rechazado' : 'En verificación';

// Confirmación después de enviar el pago final.
export const PagoEnviadoCard = ({ pedidoId, pago }: Props) => {
  const enTienda = pago?.comprobante_url === 'TIENDA_FISICA';
  return (
    <FadeInView style={styles.card}>
      <View style={styles.circulo}>
        <Ionicons name={enTienda ? 'storefront-outline' : 'checkmark'} size={34} color="#FFFFFF" />
      </View>
      <Text style={styles.titulo}>{enTienda ? 'Pago en tienda registrado' : 'Comprobante enviado'}</Text>
      <Text style={styles.texto}>{enTienda ? 'Paga tu saldo en la tienda.' : 'Estamos verificando tu pago.'}</Text>

      <View style={styles.detalle}>
        <View style={styles.fila}>
          <Text style={styles.label}>Pedido</Text>
          <Text style={styles.valor}>{folioDe(pedidoId)}</Text>
        </View>
        {!!pago && (
          <View style={styles.fila}>
            <Text style={styles.label}>Pago final</Text>
            <Text style={styles.valor}>{money(pago.monto)}</Text>
          </View>
        )}
        <View style={styles.fila}>
          <Text style={styles.label}>Estado</Text>
          <View style={styles.estado}>
            <Ionicons name="time-outline" size={16} color={textColors.primary} />
            <Text style={styles.valor}>{textoEstado(pago?.estado_pago)}</Text>
          </View>
        </View>
      </View>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: 20,
    gap: space.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: surface.border,
  },
  circulo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: brandColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  titulo: { fontFamily: fontFamily.bold, fontSize: 20, color: textColors.primary, textAlign: 'center' },
  texto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },
  detalle: {
    alignSelf: 'stretch',
    backgroundColor: surface.muted,
    borderRadius: radius.md,
    padding: 14,
    gap: 10,
    marginTop: space.sm,
  },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  estado: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary },
  valor: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
});