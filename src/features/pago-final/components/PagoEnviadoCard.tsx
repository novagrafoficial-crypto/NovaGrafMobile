import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontSize, fontWeight, iconSize, radius, space, surface, textColors } from '@/constants/theme';
import { FadeInView } from '@/shared/components/FadeInView';
import { folioDe, money } from '@/shared/utils/format';
import type { PagoRegistrado } from '../models/PagoFinal';

interface Props { pedidoId: number; pago: PagoRegistrado | null }

// Confirmación después de enviar el pago final.
export const PagoEnviadoCard = ({ pedidoId, pago }: Props) => {
  const enTienda = pago?.comprobante_url === 'TIENDA_FISICA';
  return (
    <FadeInView style={styles.card}>
      <View style={styles.circulo}>
        <Ionicons name="checkmark" size={36} color={textColors.inverse} />
      </View>
      <Text style={styles.titulo}>{enTienda ? 'Pago en tienda registrado' : 'Comprobante enviado'}</Text>
      <Text style={styles.texto}>
        Estamos verificando tu pago final. En cuanto lo confirmemos preparamos la entrega de tu pedido.
      </Text>

      <View style={styles.detalle}>
        <Fila icono="receipt-outline" label="Pedido" valor={folioDe(pedidoId)} />
        {!!pago && <Fila icono="cash-outline" label="Monto" valor={`${money(pago.monto)} MXN`} />}
        <Fila icono="time-outline" label="Estado" valor="En verificación" />
      </View>
    </FadeInView>
  );
};

const Fila = ({ icono, label, valor }: { icono: 'receipt-outline' | 'cash-outline' | 'time-outline'; label: string; valor: string }) => (
  <View style={styles.fila}>
    <Ionicons name={icono} size={iconSize.md} color={textColors.secondary} />
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.valor}>{valor}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface.card, borderRadius: radius.lg, padding: space.xl, gap: space.md,
    alignItems: 'center', borderWidth: 1, borderColor: surface.border,
  },
  circulo: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: '#35BA99',
    alignItems: 'center', justifyContent: 'center',
  },
  titulo: { fontSize: fontSize.headline, fontWeight: fontWeight.bold, color: textColors.primary, textAlign: 'center' },
  texto: { fontSize: fontSize.body, color: textColors.secondary, textAlign: 'center', lineHeight: 21 },
  detalle: { alignSelf: 'stretch', backgroundColor: surface.muted, borderRadius: radius.md, padding: space.md, gap: space.sm },
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  label: { flex: 1, fontSize: fontSize.body, color: textColors.secondary },
  valor: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: textColors.primary },
});