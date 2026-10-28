import React, { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { ChatPedidoView } from '@/features/chat-pedido-admin';
import { AdminHeader, AvisoAdmin, BotonHeader, FilaAdmin, PastillaAdmin, SeccionAdmin } from '@/shared/components/admin';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { Loading } from '@/shared/components/Loading';
import { ModalConfirmacion } from '@/shared/components/ModalConfirmacion';
import { PressableScale } from '@/shared/components/PressableScale';
import { getInitials } from '@/shared/utils/getInitials';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { HojaDetalle } from '../components/HojaDetalle';
import { PagoAdminItem } from '../components/PagoAdminItem';
import { PreviaAdminItem } from '../components/PreviaAdminItem';
import { ProximoPasoAdmin } from '../components/ProximoPasoAdmin';
import { SelectorPrevia } from '../components/SelectorPrevia';
import type { DetalleSeleccionado } from '../models/PedidoAdmin';
import {
  COLOR_ESTADO_PREVIA,
  ESTADOS_PEDIDO,
  TIENDA_FISICA,
  colorEstado,
  colorEstadoPago,
  etiquetaEstado,
  formatFecha,
  formatMoney,
  iconoEstado,
  textoTipoPago,
} from '../utils/pedidoAdminUtils';
import { usePedidoAdminDetalleViewModel } from '../viewmodels/usePedidoAdminDetalleViewModel';

const ESCALA = 1.15;
// Etapas que cuentan para la barra de progreso (sin "Cancelado")
const ETAPAS = ESTADOS_PEDIDO.filter((e) => e !== 'CANCELADO');

// Archivo que se muestra arriba en la hoja de detalle (null = sin archivo).
const archivoDeDetalle = (d: DetalleSeleccionado | null): string | null => {
  if (!d) return null;
  switch (d.tipo) {
    case 'producto':
      return d.item.imagen_url;
    case 'diseno':
      return d.item.archivo_url;
    case 'comprobante':
      return d.item.comprobante_url === TIENDA_FISICA ? null : d.item.comprobante_url;
    case 'previa':
      return d.item.imagen_url;
  }
};

const tituloDeDetalle = (d: DetalleSeleccionado | null): string => {
  if (!d) return '';
  switch (d.tipo) {
    case 'producto':
      return d.item.producto_nombre || 'Producto';
    case 'diseno':
      return 'Diseño del cliente';
    case 'comprobante':
      return `Comprobante · ${textoTipoPago(d.item.tipo_pago)}`;
    case 'previa':
      return `Previa ${d.item.numero_previa}`;
  }
};

// Caja pequeña de dinero (Total / Anticipo / Restante)
const Monto = ({ etiqueta, valor, fuerte }: { etiqueta: string; valor: number; fuerte?: boolean }) => (
  <View style={[styles.monto, fuerte && styles.montoFuerte]}>
    <Text style={[styles.montoEtiqueta, fuerte && { color: 'rgba(255,255,255,0.8)' }]} maxFontSizeMultiplier={ESCALA}>{etiqueta}</Text>
    <Text style={[styles.montoValor, fuerte && { color: '#FFFFFF' }]} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={ESCALA}>
      {formatMoney(valor)}
    </Text>
  </View>
);

export const PedidoAdminDetalleView = () => {
  const vm = usePedidoAdminDetalleViewModel();
  const d = vm.data;
  const sel = vm.detalle;
  const scrollRef = useRef<ScrollView>(null);
  // Posición de cada sección para poder bajar a ella
  const posiciones = useRef<Record<string, number>>({});
  const guardarPosicion = (clave: string) => (e: { nativeEvent: { layout: { y: number } } }) => {
    posiciones.current[clave] = e.nativeEvent.layout.y;
  };
  const irA = (clave: string) => scrollRef.current?.scrollTo({ y: Math.max(0, (posiciones.current[clave] ?? 0) - 12), animated: true });

  // Si se llegó desde una notificación de mensaje, baja directo al chat
  const { chat } = useLocalSearchParams<{ chat?: string }>();
  useEffect(() => {
    if (chat === '1' && d) {
      const t = setTimeout(() => irA('chat'), 600);
      return () => clearTimeout(t);
    }
  }, [chat, d]);

  const indiceEtapa = d ? ETAPAS.indexOf(d.pedido.estado as (typeof ETAPAS)[number]) : -1;
  const cancelado = d?.pedido.estado === 'CANCELADO';

  return (
    <View style={styles.pantalla}>
      <AdminHeader
        titulo={`Pedido #${vm.pedidoId || ''}`}
        etiqueta="Detalle del pedido"
        onBack={vm.volver}
        derecha={d ? <BotonHeader icono="chatbubbles-outline" etiqueta="Ir al chat" onPress={() => irA('chat')} /> : undefined}
      />

      <ModalConfirmacion
        visible={!!vm.confirmacion}
        titulo={vm.confirmacion?.titulo ?? ''}
        mensaje={vm.confirmacion?.mensaje ?? ''}
        icono={vm.confirmacion?.icono}
        tono={vm.confirmacion?.tono}
        textoConfirmar={vm.confirmacion?.textoConfirmar}
        textoCancelar="Volver"
        onConfirmar={() => vm.confirmacion?.onConfirmar()}
        onCancelar={vm.cerrarConfirmacion}
      />

      {/* Detalle de producto / diseño / comprobante / previa (se abre al tocarlos) */}
      <HojaDetalle
        visible={!!sel}
        titulo={tituloDeDetalle(sel)}
        archivoUrl={archivoDeDetalle(sel)}
        onCerrar={vm.cerrarDetalle}
        onAbrirArchivo={vm.abrirUrl}
      >
        {sel?.tipo === 'producto' && (
          <View>
            <FilaAdmin etiqueta="SKU" valor={sel.item.sku} />
            <FilaAdmin etiqueta="Color" valor={sel.item.color} />
            <FilaAdmin etiqueta="Cantidad" valor={String(sel.item.cantidad)} />
            <FilaAdmin etiqueta="Precio unitario" valor={formatMoney(sel.item.precio_unitario)} />
            <FilaAdmin etiqueta="Subtotal" valor={formatMoney(sel.item.subtotal)} fuerte ultima />
            {!!sel.item.descripcion && (
              <View style={styles.bloque}>
                <Text style={styles.bloqueTitulo}>Descripción</Text>
                <Text style={styles.bloqueTexto}>{sel.item.descripcion}</Text>
              </View>
            )}
          </View>
        )}

        {sel?.tipo === 'diseno' && (
          <View style={{ gap: space.md }}>
            <View style={styles.filaEntre}>
              <PastillaAdmin texto={sel.item.tipo_origen || 'Diseño'} icono="color-palette-outline" bg="#E0F2FE" fg="#075985" />
              <Text style={styles.fecha}>{formatFecha(sel.item.fecha_envio, true)}</Text>
            </View>
            {sel.item.usaSimulador && <Text style={styles.sub}>Creado con el simulador</Text>}
            {!sel.item.archivo_url && <Text style={styles.sub}>Este diseño no tiene un archivo adjunto.</Text>}
            <View style={styles.bloque}>
              <Text style={styles.bloqueTitulo}>Descripción del cliente</Text>
              <Text style={styles.bloqueTexto}>{sel.item.notas_cliente?.trim() || 'El cliente no escribió una descripción.'}</Text>
            </View>
          </View>
        )}

        {sel?.tipo === 'comprobante' && (
          <View>
            <FilaAdmin etiqueta="Tipo" valor={textoTipoPago(sel.item.tipo_pago)} />
            <FilaAdmin etiqueta="Monto" valor={formatMoney(sel.item.monto)} fuerte />
            <FilaAdmin etiqueta="Fecha" valor={formatFecha(sel.item.fecha_pago, true)} />
            <FilaAdmin etiqueta="Estado" valor={colorEstadoPago(sel.item.estado_pago).texto} ultima />
            {!!sel.item.notas_admin && (
              <View style={styles.bloque}>
                <Text style={styles.bloqueTitulo}>Notas</Text>
                <Text style={styles.bloqueTexto}>{sel.item.notas_admin}</Text>
              </View>
            )}
          </View>
        )}

        {sel?.tipo === 'previa' && (
          <View style={{ gap: space.sm }}>
            <PastillaAdmin
              texto={COLOR_ESTADO_PREVIA[vm.estadoDePrevia(sel.item)].texto}
              icono={COLOR_ESTADO_PREVIA[vm.estadoDePrevia(sel.item)].icono}
              bg={COLOR_ESTADO_PREVIA[vm.estadoDePrevia(sel.item)].bg}
              fg={COLOR_ESTADO_PREVIA[vm.estadoDePrevia(sel.item)].fg}
            />
            <View>
              <FilaAdmin etiqueta="Enviada" valor={formatFecha(sel.item.fecha_subida, true)} />
              <FilaAdmin etiqueta="Vista por el cliente" valor={sel.item.fecha_vista ? formatFecha(sel.item.fecha_vista, true) : 'Aún no'} ultima={!sel.item.aprobada} />
              {sel.item.aprobada && <FilaAdmin etiqueta="Aprobada" valor={formatFecha(sel.item.fecha_aprobacion, true)} ultima />}
            </View>
            {sel.item.rechazada && !!sel.item.comentario_cliente && (
              <View style={styles.bloque}>
                <Text style={styles.bloqueTitulo}>Cambios que pidió el cliente</Text>
                <Text style={styles.bloqueTexto}>{sel.item.comentario_cliente}</Text>
              </View>
            )}
          </View>
        )}
      </HojaDetalle>

      {vm.cargando ? (
        <Loading fullScreen />
      ) : !d ? (
        <View style={styles.centro}>
          <Ionicons name="cloud-offline-outline" size={40} color={textColors.muted} />
          <Text style={styles.errorTexto}>{vm.error ?? 'Pedido no encontrado.'}</Text>
          <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} />
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={vm.refrescando} onRefresh={vm.refrescar} tintColor={brandColors.primary} colors={[brandColors.primary]} />
            }
          >
            {vm.aviso && <AvisoAdmin texto={vm.aviso.texto} ok={vm.aviso.ok} />}

            {/* 1. Qué sigue */}
            {vm.proximoPaso && (
              <FadeInView>
                <ProximoPasoAdmin paso={vm.proximoPaso} onIrA={irA} deshabilitado={vm.trabajando} />
              </FadeInView>
            )}

            {/* 2. Resumen */}
            <FadeInView delay={60}>
              <SeccionAdmin
                titulo="Resumen"
                icono="document-text-outline"
                derecha={
                  <PastillaAdmin
                    texto={etiquetaEstado(d.pedido.estado)}
                    icono={iconoEstado(d.pedido.estado)}
                    bg={colorEstado(d.pedido.estado).bg}
                    fg={colorEstado(d.pedido.estado).fg}
                  />
                }
              >
                {/* Cliente */}
                <View style={styles.cliente}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarTexto} maxFontSizeMultiplier={1}>{getInitials(d.pedido.cliente_nombre)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clienteNombre} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{d.pedido.cliente_nombre}</Text>
                    <Text style={styles.sub} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>{d.pedido.cliente_correo}</Text>
                  </View>
                  <Text style={styles.fecha} maxFontSizeMultiplier={ESCALA}>{formatFecha(d.pedido.fecha_pedido)}</Text>
                </View>

                {/* Dinero */}
                <View style={styles.montos}>
                  <Monto etiqueta="Total" valor={d.pedido.total_general} fuerte />
                  <Monto etiqueta="Anticipo" valor={d.pedido.monto_anticipo} />
                  <Monto etiqueta="Restante" valor={d.pedido.monto_restante} />
                </View>

                {/* Avance */}
                {!cancelado && indiceEtapa >= 0 && (
                  <View style={{ gap: 6 }}>
                    <View style={styles.filaEntre}>
                      <Text style={styles.sub} maxFontSizeMultiplier={ESCALA}>Avance del pedido</Text>
                      <Text style={styles.avanceTexto} maxFontSizeMultiplier={ESCALA}>Etapa {indiceEtapa + 1} de {ETAPAS.length}</Text>
                    </View>
                    <View style={styles.avanceFondo}>
                      <View style={[styles.avance, { width: `${((indiceEtapa + 1) / ETAPAS.length) * 100}%` }]} />
                    </View>
                  </View>
                )}

                <View>
                  <FilaAdmin etiqueta="Método de pago" valor={d.pedido.metodo_pago} />
                  <FilaAdmin etiqueta="Entrega" valor={d.pedido.metodo_entrega} />
                  <FilaAdmin etiqueta="Dirección" valor={d.pedido.direccion_envio} ultima />
                </View>
              </SeccionAdmin>
            </FadeInView>

            {/* 3. Productos */}
            <SeccionAdmin titulo="Productos" icono="cube-outline" derecha={`${d.productos.length}`}>
              {d.productos.length === 0 ? (
                <Text style={styles.sub}>Sin productos.</Text>
              ) : (
                d.productos.map((p, i) => {
                  const img = resolveImageUrl(p.imagen_url);
                  return (
                    <PressableScale
                      key={`${p.sku}-${i}`}
                      style={[styles.producto, i < d.productos.length - 1 && styles.linea]}
                      onPress={() => vm.abrirDetalle({ tipo: 'producto', item: p })}
                      scaleTo={0.98}
                    >
                      {img ? (
                        <Image source={{ uri: img }} style={styles.productoImg} contentFit="cover" cachePolicy="memory-disk" />
                      ) : (
                        <View style={[styles.productoImg, styles.centrado]}>
                          <Ionicons name="cube-outline" size={20} color={textColors.muted} />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.productoNombre} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>{p.producto_nombre}</Text>
                        <Text style={styles.sub} maxFontSizeMultiplier={ESCALA}>
                          {p.cantidad} × {formatMoney(p.precio_unitario)}{p.color ? ` · ${p.color}` : ''}
                        </Text>
                      </View>
                      <Text style={styles.productoTotal} maxFontSizeMultiplier={ESCALA}>{formatMoney(p.subtotal)}</Text>
                    </PressableScale>
                  );
                })
              )}
            </SeccionAdmin>

            {/* 4. Diseño del cliente */}
            {d.disenos.length > 0 && (
              <SeccionAdmin titulo="Diseño del cliente" icono="color-palette-outline" derecha={`${d.disenos.length}`}>
                {d.disenos.map((x) => (
                  <PressableScale key={x.id} style={styles.diseno} onPress={() => vm.abrirDetalle({ tipo: 'diseno', item: x })} scaleTo={0.98}>
                    <View style={styles.filaEntre}>
                      <PastillaAdmin texto={x.tipo_origen || 'Diseño'} icono="color-palette-outline" bg="#E0F2FE" fg="#075985" />
                      <Text style={styles.fecha}>{formatFecha(x.fecha_envio)}</Text>
                    </View>
                    {!!x.notas_cliente && (
                      <Text style={styles.nota} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>“{x.notas_cliente}”</Text>
                    )}
                    <View style={styles.verMas}>
                      <Text style={styles.verMasTexto} maxFontSizeMultiplier={ESCALA}>Ver archivo y descripción</Text>
                      <Ionicons name="chevron-forward" size={15} color={brandColors.primary} />
                    </View>
                  </PressableScale>
                ))}
              </SeccionAdmin>
            )}

            {/* 5. Pagos */}
            <View onLayout={guardarPosicion('pagos')}>
              <SeccionAdmin titulo="Pagos" icono="wallet-outline" derecha={`${d.pagos.length}`}>
                {vm.pagosOrdenados.length === 0 ? (
                  <Text style={styles.sub}>El cliente aún no sube comprobantes.</Text>
                ) : (
                  <View>
                    {vm.pagosOrdenados.map((p, i) => (
                      <PagoAdminItem
                        key={p.id}
                        pago={p}
                        nota={vm.notasPago[p.id] ?? ''}
                        onNota={(t) => vm.editarNotaPago(p.id, t)}
                        onVer={() => vm.abrirDetalle({ tipo: 'comprobante', item: p })}
                        onAprobar={() => vm.pedirResolverPago(p, 'APROBADO')}
                        onRechazar={() => vm.pedirResolverPago(p, 'RECHAZADO')}
                        trabajando={vm.trabajando}
                        ultimo={i === vm.pagosOrdenados.length - 1}
                      />
                    ))}
                  </View>
                )}
              </SeccionAdmin>
            </View>

            {/* 6. Previas */}
            <View onLayout={guardarPosicion('previas')}>
              <SeccionAdmin titulo="Previas de diseño" icono="images-outline" derecha={`${d.previas.length}`}>
                {vm.bannerPrevias && (
                  <View
                    style={[
                      styles.banner,
                      vm.bannerPrevias.tono === 'ok' && styles.bannerOk,
                      vm.bannerPrevias.tono === 'aviso' && styles.bannerAviso,
                    ]}
                  >
                    <Ionicons
                      name={vm.bannerPrevias.tono === 'ok' ? 'checkmark-circle-outline' : vm.bannerPrevias.tono === 'aviso' ? 'refresh-circle-outline' : 'information-circle-outline'}
                      size={18}
                      color={vm.bannerPrevias.tono === 'ok' ? '#166534' : vm.bannerPrevias.tono === 'aviso' ? '#9A3412' : '#075985'}
                    />
                    <Text style={styles.bannerTexto} maxFontSizeMultiplier={ESCALA}>{vm.bannerPrevias.texto}</Text>
                  </View>
                )}

                {d.previas.length === 0 && !vm.bannerPrevias && (
                  <Text style={styles.sub}>Las previas se envían cuando el cliente manda su diseño.</Text>
                )}

                {d.previas.map((p) => (
                  <PreviaAdminItem key={p.id} previa={p} onPress={() => vm.abrirDetalle({ tipo: 'previa', item: p })} />
                ))}

                {/* Se envía UNA previa a la vez. Si el cliente pide cambios, aparece de nuevo para subir otra. */}
                {vm.puedeEnviarPrevia && (
                  <View style={styles.formPrevia}>
                    <SelectorPrevia
                      titulo={`Nueva previa · ${vm.siguientePrevia}`}
                      archivo={vm.previa}
                      onElegir={vm.elegirPrevia}
                      onQuitar={vm.quitarPrevia}
                      disabled={vm.trabajando}
                    />
                    <CustomButton
                      title={vm.trabajando ? 'Subiendo imagen…' : `Enviar previa ${vm.siguientePrevia} al cliente`}
                      icon={<Ionicons name="send" size={18} color="#FFFFFF" />}
                      onPress={vm.pedirEnviarPrevia}
                      disabled={vm.trabajando || !vm.previa}
                    />
                  </View>
                )}
              </SeccionAdmin>
            </View>

            {/* 7. Chat con el cliente */}
            <View onLayout={guardarPosicion('chat')}>
              <ChatPedidoView pedidoId={vm.pedidoId} onInputFocus={() => setTimeout(() => irA('chat'), 300)} />
            </View>

            {/* 8. Cancelar (al final, para no tocarlo por error) */}
            {vm.puedeCancelar && (
              <PressableScale style={styles.cancelar} onPress={vm.pedirCancelar} disabled={vm.trabajando} scaleTo={0.97}>
                <Ionicons name="close-circle-outline" size={19} color={brandColors.error} />
                <Text style={styles.cancelarTexto} maxFontSizeMultiplier={ESCALA}>Cancelar pedido</Text>
              </PressableScale>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  scroll: { padding: space.lg, paddingBottom: 48, gap: space.lg },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xl },
  centrado: { alignItems: 'center', justifyContent: 'center' },
  errorTexto: { fontFamily: fontFamily.medium, fontSize: 15, color: textColors.primary, textAlign: 'center' },

  filaEntre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  sub: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
  fecha: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.muted },
  linea: { borderBottomWidth: 1, borderBottomColor: surface.muted },

  // Cliente
  cliente: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: brandColors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { fontFamily: fontFamily.bold, fontSize: 15, color: '#FFFFFF' },
  clienteNombre: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },

  // Montos
  montos: { flexDirection: 'row', gap: space.sm },
  monto: { flex: 1, backgroundColor: surface.muted, borderRadius: radius.md, padding: 10, gap: 2 },
  montoFuerte: { backgroundColor: brandColors.primary },
  montoEtiqueta: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.secondary },
  montoValor: { fontFamily: fontFamily.bold, fontSize: 15, color: textColors.primary },

  // Avance
  avanceTexto: { fontFamily: fontFamily.semibold, fontSize: 13, color: textColors.primary },
  avanceFondo: { height: 8, borderRadius: 4, backgroundColor: surface.muted, overflow: 'hidden' },
  avance: { height: 8, borderRadius: 4, backgroundColor: brandColors.accent },

  // Productos
  producto: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 10 },
  productoImg: { width: 52, height: 52, borderRadius: radius.sm, backgroundColor: surface.muted },
  productoNombre: { fontFamily: fontFamily.semibold, fontSize: 14, color: textColors.primary },
  productoTotal: { fontFamily: fontFamily.bold, fontSize: 15, color: textColors.primary },

  // Diseño
  diseno: { gap: space.sm, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: surface.border },
  nota: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.primary, fontStyle: 'italic' },
  verMas: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  verMasTexto: { fontFamily: fontFamily.semibold, fontSize: 13, color: brandColors.primary },

  // Previas
  banner: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: '#F0F9FF' },
  bannerOk: { backgroundColor: '#F0FDF4' },
  bannerAviso: { backgroundColor: '#FFF7ED' },
  bannerTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },
  formPrevia: { gap: space.md, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: surface.muted },

  // Hoja de detalle
  bloque: { gap: 4, backgroundColor: surface.muted, borderRadius: radius.md, padding: space.md, marginTop: space.sm },
  bloqueTitulo: { fontFamily: fontFamily.semibold, fontSize: 13, color: textColors.secondary },
  bloqueTexto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.primary, lineHeight: 20 },

  // Cancelar
  cancelar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: surface.card,
  },
  cancelarTexto: { fontFamily: fontFamily.semibold, fontSize: 15, color: brandColors.error },
});
