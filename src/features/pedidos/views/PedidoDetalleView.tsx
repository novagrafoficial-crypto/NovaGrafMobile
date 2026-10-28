import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePedidoDetalleViewModel } from '../viewmodels/usePedidoDetalleViewModel';
import { ProgresoPedido } from '../components/ProgresoPedido';
import { SiguientePasoCard } from '../components/SiguientePasoCard';
import { EtapaCard } from '../components/EtapaCard';
import { ComprobanteItem } from '../components/ComprobanteItem';
import { DisenoEnviadoItem } from '../components/DisenoEnviadoItem';
import { PreviaItem } from '../components/PreviaItem';
import { RechazarPreviaModal } from '../components/RechazarPreviaModal';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { PressableScale } from '@/shared/components/PressableScale';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { folioDe, formatFecha, money } from '@/shared/utils/format';
import { brandColors } from '@/constants/brand';
import { fontSize, fontWeight, iconSize, radius, space, surface, textColors } from '@/constants/theme';
import type { EtapaId, IconoNombre } from '../utils/etapasPedido';

// ── Piezas pequeñas reutilizadas dentro de las etapas ──────────
const Fila = ({ label, valor, fuerte }: { label: string; valor: string; fuerte?: boolean }) => (
  <View style={styles.fila}>
    <Text style={[styles.label, fuerte && styles.labelFuerte]}>{label}</Text>
    <Text style={[styles.valor, fuerte && styles.valorFuerte]}>{valor}</Text>
  </View>
);

const Vacio = ({ icono, texto }: { icono: IconoNombre; texto: string }) => (
  <View style={styles.vacio}>
    <Ionicons name={icono} size={iconSize.md} color={textColors.muted} />
    <Text style={styles.vacioTxt}>{texto}</Text>
  </View>
);

const Dato = ({ icono, texto, fuerte }: { icono: IconoNombre; texto: string; fuerte?: boolean }) => (
  <View style={styles.dato}>
    <Ionicons name={icono} size={iconSize.md} color={textColors.secondary} />
    <Text style={[styles.datoTxt, fuerte && styles.datoFuerte]}>{texto}</Text>
  </View>
);

const icono = (name: IconoNombre, color: string = textColors.inverse) => (
  <Ionicons name={name} size={iconSize.md} color={color} />
);

export const PedidoDetalleView = ({ pedidoId }: { pedidoId: number }) => {
  const vm = usePedidoDetalleViewModel(pedidoId);
  const p = vm.pedido;

  // Contenido de cada etapa al desplegarla
  const contenidoEtapa = (id: EtapaId): React.ReactNode => {
    if (!p) return null;
    switch (id) {
      case 'pedido':
        return (
          <>
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
            <View style={styles.linea} />
            <Fila label="Subtotal productos" valor={money(p.total_productos)} />
            <Fila label="Costo de envío" valor={money(p.costo_envio)} />
            <Fila label="Total" valor={money(p.total_general)} fuerte />
          </>
        );

      case 'anticipo':
        return (
          <>
            <Fila label="Anticipo (50%)" valor={money(p.monto_anticipo)} fuerte />
            {!!p.metodo_pago_nombre && <Fila label="Método de pago" valor={p.metodo_pago_nombre} />}
            {vm.pagoAnticipo ? (
              <ComprobanteItem pago={vm.pagoAnticipo} onAbrirUrl={vm.abrirUrl} />
            ) : (
              <Vacio icono="receipt-outline" texto="Todavía no registras tu anticipo." />
            )}
            {(vm.debePagar || vm.tienePago) && (
              <CustomButton
                title={vm.debePagar ? 'Pagar anticipo' : 'Ver datos de pago'}
                variant={vm.debePagar ? 'primary' : 'outline'}
                icon={icono(vm.debePagar ? 'card-outline' : 'document-text-outline', vm.debePagar ? textColors.inverse : textColors.primary)}
                onPress={vm.irAPagar}
              />
            )}
          </>
        );

      case 'diseno':
        return (
          <>
            {vm.disenos.length === 0 ? (
              <Vacio icono="image-outline" texto="Todavía no has enviado diseños para este pedido." />
            ) : (
              vm.disenos.map((d) => (
                <DisenoEnviadoItem
                  key={d.id}
                  diseno={d}
                  producto={p.detalles.find((x) => x.variante_id === d.variante_id)}
                  onAbrirUrl={vm.abrirUrl}
                />
              ))
            )}
            {vm.debeSubirDiseno && (
              <CustomButton title="Subir mis diseños" icon={icono('cloud-upload-outline')} onPress={vm.irADiseno} />
            )}
          </>
        );

      case 'previas':
        return (
          <>
            {vm.previas.length === 0 ? (
              <Vacio icono="hourglass-outline" texto="Aún no te enviamos previas. Te avisaremos cuando haya una." />
            ) : (
              // La más reciente primero: es la que importa
              [...vm.previas].reverse().map((pr) => (
                <PreviaItem
                  key={pr.id}
                  previa={pr}
                  deshabilitado={vm.enviandoRevision}
                  onAprobar={vm.previaPendiente?.id === pr.id ? () => vm.aprobarPrevia(pr) : undefined}
                  onRechazar={vm.previaPendiente?.id === pr.id ? () => vm.abrirRechazo(pr) : undefined}
                />
              ))
            )}
            <PressableScale onPress={vm.irAChat} style={styles.linkChat}>
              <Ionicons name="chatbubble-ellipses-outline" size={iconSize.md} color={brandColors.primary} />
              <Text style={styles.linkChatTxt}>¿Dudas sobre tu previa? Escríbenos</Text>
            </PressableScale>
          </>
        );

      case 'produccion':
        return (
          <Vacio
            icono="construct-outline"
            texto={
              p.estado === 'EN_PRODUCCION'
                ? 'Tu diseño fue aprobado y ya se está fabricando.'
                : 'La producción de tu pedido terminó.'
            }
          />
        );

      case 'pagoFinal':
        return (
          <>
            <Fila label="Saldo restante (50%)" valor={money(p.monto_restante)} fuerte />
            {vm.pagoFinal ? (
              <ComprobanteItem pago={vm.pagoFinal} onAbrirUrl={vm.abrirUrl} />
            ) : (
              <Vacio icono="cash-outline" texto="Cuando tu pedido esté listo te pediremos el pago final." />
            )}
            {vm.puedePagarFinal && (
              <CustomButton title="Pagar saldo" icon={icono('card-outline')} onPress={vm.irAPagoFinal} />
            )}
          </>
        );

      case 'entrega':
        return (
          <>
            <Dato icono="car-outline" texto={p.metodo_entrega_nombre} fuerte />
            {!!p.direccion_envio && <Dato icono="location-outline" texto={p.direccion_envio} />}
            {!!p.fecha_entrega_estimada && (
              <Dato icono="calendar-outline" texto={`Entrega estimada: ${formatFecha(p.fecha_entrega_estimada)}`} />
            )}
          </>
        );
    }
  };

  const cuerpo = () => {
    if (vm.cargando) return <Loading fullScreen />;
    if (vm.error || !p) {
      return (
        <View style={styles.centrado}>
          <Ionicons name="cloud-offline-outline" size={40} color={textColors.muted} />
          <Text style={styles.error}>{vm.error ?? 'Pedido no encontrado'}</Text>
          <CustomButton title="Reintentar" onPress={vm.reintentar} style={{ marginTop: space.md }} />
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={vm.reintentar}
            tintColor={brandColors.primary}
            colors={[brandColors.primary]}
          />
        }
      >
        <ProgresoPedido pedido={p} etapas={vm.etapas} progreso={vm.progreso} cancelado={vm.cancelado} />

        {vm.siguientePaso && <SiguientePasoCard paso={vm.siguientePaso} />}

        <Text style={styles.seccionTitulo}>Seguimiento del pedido</Text>
        <View>
          {vm.etapas.map((e, i) => (
            <EtapaCard
              key={e.id}
              etapa={e}
              abierta={vm.etapaAbierta === e.id}
              esUltima={i === vm.etapas.length - 1}
              onToggle={() => vm.toggleEtapa(e.id)}
            >
              {contenidoEtapa(e.id)}
            </EtapaCard>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title={p ? folioDe(p.id) : 'Pedido'} onBack={vm.volver} />
      <View style={{ flex: 1 }}>{cuerpo()}</View>

      {/* Chat siempre a la mano, en su propia pantalla */}
      {!!p && (
        <PressableScale onPress={vm.irAChat} style={styles.fab} scaleTo={0.9} accessibilityLabel="Abrir chat del pedido">
          <Ionicons name="chatbubble-ellipses" size={26} color={textColors.inverse} />
        </PressableScale>
      )}

      <RechazarPreviaModal
        visible={!!vm.previaARechazar}
        numeroPrevia={vm.previaARechazar?.numero_previa ?? null}
        enviando={vm.enviandoRevision}
        error={vm.errorRevision}
        onCancelar={vm.cerrarRechazo}
        onConfirmar={vm.confirmarRechazo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  scroll: { padding: space.lg, paddingBottom: 100, gap: space.lg },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  error: { color: textColors.secondary, fontSize: fontSize.body, textAlign: 'center' },
  seccionTitulo: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: textColors.primary, marginTop: space.xs },
  // productos
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  img: { width: 52, height: 52, borderRadius: radius.sm, backgroundColor: surface.muted },
  itemNombre: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: textColors.primary },
  itemDetalle: { fontSize: fontSize.small, color: textColors.muted, marginTop: 2 },
  itemSubtotal: { fontSize: fontSize.body, fontWeight: fontWeight.bold, color: textColors.primary },
  // filas de importes
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: fontSize.body, color: textColors.secondary },
  valor: { fontSize: fontSize.body, fontWeight: fontWeight.medium, color: textColors.primary },
  labelFuerte: { fontWeight: fontWeight.semibold, color: textColors.primary },
  valorFuerte: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, color: textColors.primary },
  linea: { height: 1, backgroundColor: surface.border },
  // datos con ícono
  dato: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  datoTxt: { flex: 1, fontSize: fontSize.body, color: textColors.secondary, lineHeight: 21 },
  datoFuerte: { fontWeight: fontWeight.semibold, color: textColors.primary },
  // vacío
  vacio: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    backgroundColor: surface.muted, borderRadius: radius.md, padding: space.md,
  },
  vacioTxt: { flex: 1, fontSize: fontSize.small, color: textColors.secondary, lineHeight: 19 },
  // chat
  linkChat: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.xs },
  linkChatTxt: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: brandColors.primary },
  fab: {
    position: 'absolute', right: space.lg, bottom: space.xl,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: brandColors.primary, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
});