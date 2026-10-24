import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { usePedidoDetalleViewModel } from '../viewmodels/usePedidoDetalleViewModel';
import { EstadoBadge } from '../components/EstadoBadge';
import { ComprobanteItem } from '../components/ComprobanteItem';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { folioDe, formatFecha, money } from '@/shared/utils/format';
import { brandColors, brandTints } from '@/constants/brand';

const Seccion = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <FadeInView style={styles.seccion}>
    <Text style={styles.seccionTitulo}>{titulo}</Text>
    {children}
  </FadeInView>
);

const Fila = ({ label, valor, fuerte }: { label: string; valor: string; fuerte?: boolean }) => (
  <View style={styles.fila}>
    <Text style={[styles.label, fuerte && styles.fuerte]}>{label}</Text>
    <Text style={[styles.valor, fuerte && styles.fuerte]}>{valor}</Text>
  </View>
);

export const PedidoDetalleView = ({ pedidoId }: { pedidoId: number }) => {
  const vm = usePedidoDetalleViewModel(pedidoId);
  const p = vm.pedido;

  const cuerpo = () => {
    if (vm.cargando) return <Loading fullScreen />;
    if (vm.error || !p) {
      return (
        <View style={styles.centrado}>
          <Text style={styles.error}>{vm.error ?? 'Pedido no encontrado'}</Text>
          <CustomButton title="Reintentar" onPress={vm.reintentar} style={{ marginTop: 12 }} />
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.encabezado}>
          <View>
            <Text style={styles.folio}>{folioDe(p.id)}</Text>
            <Text style={styles.fecha}>{formatFecha(p.fecha_pedido)}</Text>
          </View>
          <EstadoBadge estado={p.estado} />
        </View>

        <Seccion titulo="Productos">
          <View style={styles.caja}>
            {p.detalles.map((d, i) => (
              <View key={i} style={styles.item}>
                <Image
                  source={{ uri: resolveImageUrl(d.imagen_url) || 'https://placehold.co/100x100?text=-' }}
                  style={styles.img}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemNombre} numberOfLines={2}>{d.producto_nombre}</Text>
                  <Text style={styles.itemDetalle}>
                    {d.color ? `${d.color} · ` : ''}{d.cantidad} × {money(d.precio_unitario)}
                  </Text>
                </View>
                <Text style={styles.itemSubtotal}>{money(d.subtotal)}</Text>
              </View>
            ))}
          </View>
        </Seccion>

        <Seccion titulo="Entrega">
          <View style={styles.caja}>
            <Text style={styles.dato}>{p.metodo_entrega_nombre}</Text>
            {!!p.direccion_envio && <Text style={styles.datoSec}>{p.direccion_envio}</Text>}
            {!!p.fecha_entrega_estimada && (
              <Text style={styles.datoSec}>Entrega estimada: {formatFecha(p.fecha_entrega_estimada)}</Text>
            )}
          </View>
        </Seccion>

        <Seccion titulo="Pago">
          <View style={styles.caja}>
            {!!p.metodo_pago_nombre && <Text style={styles.dato}>{p.metodo_pago_nombre}</Text>}
            <Fila label="Subtotal productos" valor={money(p.total_productos)} />
            <Fila label="Costo de envío" valor={money(p.costo_envio)} />
            <View style={styles.linea} />
            <Fila label="Total" valor={money(p.total_general)} fuerte />
            <Fila label="Anticipo (50%)" valor={money(p.monto_anticipo)} />
            <Fila label="Saldo restante (50%)" valor={money(p.monto_restante)} />
          </View>
        </Seccion>

        <Seccion titulo={`Comprobantes (${p.pagos.length})`}>
          {p.pagos.length === 0 ? (
            <Text style={styles.vacio}>Todavía no has registrado ningún pago.</Text>
          ) : (
            <View style={{ gap: 10 }}>
              {p.pagos.map((pg) => (
                <ComprobanteItem key={pg.id} pago={pg} onAbrirUrl={vm.abrirUrl} />
              ))}
            </View>
          )}
        </Seccion>
      </ScrollView>
    );
  };
    const mostrarBoton = !!p && (vm.debeSubirDiseno || vm.debePagar || vm.tienePago);

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title={p ? folioDe(p.id) : 'Pedido'} onBack={vm.volver} />
      <View style={{ flex: 1 }}>{cuerpo()}</View>

      {mostrarBoton && (
        <View style={styles.barra}>
          {vm.debeSubirDiseno ? (
            <CustomButton title="🎨 Subir mis diseños" onPress={vm.irADiseno} />
          ) : (
            <CustomButton
              title={vm.debePagar ? '💳 Pagar anticipo / subir comprobante' : '🏦 Ver datos de pago'}
              onPress={vm.irAPagar}
            />
          )}
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  scroll: { padding: 16, paddingBottom: 28, gap: 16 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: brandColors.error, textAlign: 'center', fontWeight: '500' },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  folio: { fontSize: 22, fontWeight: '800', color: brandColors.primaryDark },
  fecha: { fontSize: 12, color: brandTints.textMuted },
  seccion: { gap: 8 },
  seccionTitulo: { fontSize: 15, fontWeight: '800', color: brandColors.primaryDark },
  caja: { backgroundColor: brandColors.white, borderRadius: 14, padding: 14, gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  img: { width: 48, height: 48, borderRadius: 8, backgroundColor: brandTints.surfaceMuted },
  itemNombre: { fontSize: 13, fontWeight: '700', color: brandColors.primaryDark },
  itemDetalle: { fontSize: 11, color: brandTints.textMuted, marginTop: 1 },
  itemSubtotal: { fontSize: 13, fontWeight: '800', color: brandColors.primary },
  dato: { fontSize: 14, fontWeight: '700', color: brandColors.primaryDark },
  datoSec: { fontSize: 13, color: brandTints.textMuted },
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 13, color: brandTints.textMuted },
  valor: { fontSize: 13, fontWeight: '700', color: brandColors.primaryDark },
  fuerte: { fontSize: 16, fontWeight: '800', color: brandColors.primaryDark },
  linea: { height: 1, backgroundColor: brandTints.border },
  vacio: { fontSize: 13, color: brandTints.textMuted },
  barra: { backgroundColor: brandColors.white, padding: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
});