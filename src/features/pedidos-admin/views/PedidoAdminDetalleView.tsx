import { brandColors, brandTints } from '@/constants/brand';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { Loading } from '@/shared/components/Loading';
import { ModalConfirmacion } from '@/shared/components/ModalConfirmacion';
import { PressableScale } from '@/shared/components/PressableScale';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import React from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { HojaDetalle } from '../components/HojaDetalle';
import { SelectorPrevia } from '../components/SelectorPrevia';
import type { DetalleSeleccionado } from '../models/PedidoAdmin';
import {
  COLOR_ESTADO_PREVIA,
  TIENDA_FISICA,
  colorEstado,
  colorEstadoPago,
  esPdf,
  etiquetaEstado,
  formatFecha,
  formatMoney,
} from '../utils/pedidoAdminUtils';
import { usePedidoAdminDetalleViewModel } from '../viewmodels/usePedidoAdminDetalleViewModel';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';

const Seccion = ({
  titulo,
  children,
  delay = 0,
}: {
  titulo: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <FadeInView delay={delay} style={styles.card}>
    <Text style={styles.cardTitulo}>{titulo}</Text>
    {children}
  </FadeInView>
);

const Fila = ({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{etiqueta}</Text>
    <Text style={styles.infoValue}>{valor || '—'}</Text>
  </View>
);

const Pastilla = ({ texto, bg, fg }: { texto: string; bg: string; fg: string }) => (
  <View style={[styles.badge, { backgroundColor: bg }]}>
    <Text style={[styles.badgeTxt, { color: fg }]}>{texto}</Text>
  </View>
);

const Enlace = ({ texto, onPress }: { texto: string; onPress: () => void }) => (
  <PressableScale onPress={onPress} scaleTo={0.95} hitSlop={8}>
    <Text style={styles.enlace}>{texto}</Text>
  </PressableScale>
);

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
      return `Comprobante — ${d.item.tipo_pago}`;
    case 'previa':
      return `Previa ${d.item.numero_previa}`;
  }
};

export const PedidoAdminDetalleView = () => {
  const vm = usePedidoAdminDetalleViewModel();
  const d = vm.data;
  const estado = d?.pedido.estado;
  const sel = vm.detalle;

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title={`Pedido #${vm.pedidoId || ''}`} onBack={vm.volver} />

      <ModalConfirmacion
        visible={!!vm.confirmacion}
        titulo={vm.confirmacion?.titulo ?? ''}
        mensaje={vm.confirmacion?.mensaje ?? ''}
        icono={vm.confirmacion?.icono}
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
            <Fila etiqueta="SKU" valor={sel.item.sku} />
            <Fila etiqueta="Color" valor={sel.item.color} />
            <Fila etiqueta="Cantidad" valor={String(sel.item.cantidad)} />
            <Fila etiqueta="Precio unitario" valor={formatMoney(sel.item.precio_unitario)} />
            <Fila etiqueta="Subtotal" valor={formatMoney(sel.item.subtotal)} />
            {!!sel.item.descripcion && (
              <View style={styles.bloqueTexto}>
                <Text style={styles.bloqueTitulo}>Descripción</Text>
                <Text style={styles.bloqueCuerpo}>{sel.item.descripcion}</Text>
              </View>
            )}
          </View>
        )}

        {sel?.tipo === 'diseno' && (
          <View style={{ gap: 10 }}>
            <View style={styles.resumenTop}>
              <Pastilla texto={sel.item.tipo_origen || 'Diseño'} bg="#d0eaff" fg="#0a4a7c" />
              <Text style={styles.fecha}>{formatFecha(sel.item.fecha_envio, true)}</Text>
            </View>
            {sel.item.usaSimulador && <Text style={styles.productoSub}>Creado con el simulador</Text>}
            {!sel.item.archivo_url && (
              <Text style={styles.vacio}>Este diseño no tiene un archivo adjunto.</Text>
            )}
            <View style={styles.bloqueTexto}>
              <Text style={styles.bloqueTitulo}>Descripción del cliente</Text>
              <Text style={styles.bloqueCuerpo}>
                {sel.item.notas_cliente?.trim() || 'El cliente no escribió una descripción.'}
              </Text>
            </View>
          </View>
        )}

        {sel?.tipo === 'comprobante' && (
          <View>
            <Fila etiqueta="Tipo de pago" valor={sel.item.tipo_pago} />
            <Fila etiqueta="Monto" valor={formatMoney(sel.item.monto)} />
            <Fila etiqueta="Fecha" valor={formatFecha(sel.item.fecha_pago, true)} />
            <Fila etiqueta="Estado" valor={sel.item.estado_pago} />
            {!!sel.item.notas_admin && (
              <View style={styles.bloqueTexto}>
                <Text style={styles.bloqueTitulo}>Notas</Text>
                <Text style={styles.bloqueCuerpo}>{sel.item.notas_admin}</Text>
              </View>
            )}
          </View>
        )}

        {sel?.tipo === 'previa' && (
          <View style={{ gap: 10 }}>
            <Pastilla
              texto={COLOR_ESTADO_PREVIA[vm.estadoDePrevia(sel.item)].texto}
              bg={COLOR_ESTADO_PREVIA[vm.estadoDePrevia(sel.item)].bg}
              fg={COLOR_ESTADO_PREVIA[vm.estadoDePrevia(sel.item)].fg}
            />
            <View>
              <Fila etiqueta="Enviada" valor={formatFecha(sel.item.fecha_subida, true)} />
              <Fila
                etiqueta="Vista por el cliente"
                valor={sel.item.fecha_vista ? formatFecha(sel.item.fecha_vista, true) : 'Aún no'}
              />
              {sel.item.aprobada && (
                <Fila etiqueta="Aprobada" valor={formatFecha(sel.item.fecha_aprobacion, true)} />
              )}
            </View>
          </View>
        )}
      </HojaDetalle>

      {vm.cargando ? (
        <Loading fullScreen />
      ) : !d ? (
        <View style={styles.centro}>
          <Text style={styles.errorTxt}>{vm.error ?? 'Pedido no encontrado.'}</Text>
          <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={vm.refrescando}
              onRefresh={vm.refrescar}
              tintColor={brandColors.primary}
              colors={[brandColors.primary]}
            />
          }
        >
          {vm.aviso && (
            <FadeInView
              distance={-10}
              duration={250}
              style={[styles.aviso, vm.aviso.ok ? styles.avisoOk : styles.avisoErr]}
            >
              <Text style={[styles.avisoTxt, vm.aviso.ok ? styles.avisoTxtOk : styles.avisoTxtErr]}>
                {vm.aviso.texto}
              </Text>
            </FadeInView>
          )}
          {vm.error && <Text style={styles.errorTxt}>{vm.error}</Text>}

          <Seccion titulo="Resumen">
            <View style={styles.resumenTop}>
              <Text style={styles.fecha}>{formatFecha(d.pedido.fecha_pedido, true)}</Text>
              <Pastilla
                texto={etiquetaEstado(d.pedido.estado)}
                bg={colorEstado(d.pedido.estado).bg}
                fg={colorEstado(d.pedido.estado).fg}
              />
            </View>
            <Fila etiqueta="Cliente" valor={d.pedido.cliente_nombre} />
            <Fila etiqueta="Correo" valor={d.pedido.cliente_correo} />
            <Fila etiqueta="Total" valor={formatMoney(d.pedido.total_general)} />
            <Fila etiqueta="Anticipo" valor={formatMoney(d.pedido.monto_anticipo)} />
            <Fila etiqueta="Restante" valor={formatMoney(d.pedido.monto_restante)} />
            <Fila etiqueta="Método de pago" valor={d.pedido.metodo_pago} />
            <Fila etiqueta="Entrega" valor={d.pedido.metodo_entrega} />
            <Fila etiqueta="Dirección" valor={d.pedido.direccion_envio} />
          </Seccion>

          <Seccion titulo="Productos" delay={60}>
            {d.productos.length === 0 ? (
              <Text style={styles.vacio}>Sin productos.</Text>
            ) : (
              d.productos.map((p, i) => (
                <PressableScale
                  key={`${p.sku}-${i}`}
                  style={styles.producto}
                  onPress={() => vm.abrirDetalle({ tipo: 'producto', item: p })}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver detalle de ${p.producto_nombre}`}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productoNombre}>{p.producto_nombre}</Text>
                    <Text style={styles.productoSub}>
                      SKU: {p.sku} · Cantidad: {p.cantidad}
                    </Text>
                  </View>
                  <Text style={styles.productoPrecio}>{formatMoney(p.precio_unitario)}</Text>
                  <Text style={styles.chevron}>›</Text>
                </PressableScale>
              ))
            )}
          </Seccion>

          {d.disenos.length > 0 && (
            <Seccion titulo="Diseño del cliente" delay={100}>
              {d.disenos.map((x) => (
                <PressableScale
                  key={x.id}
                  style={styles.bloque}
                  onPress={() => vm.abrirDetalle({ tipo: 'diseno', item: x })}
                  accessibilityRole="button"
                  accessibilityLabel="Ver diseño del cliente"
                >
                  <View style={styles.resumenTop}>
                    <Pastilla texto={x.tipo_origen || 'Diseño'} bg="#d0eaff" fg="#0a4a7c" />
                    <Text style={styles.fecha}>{formatFecha(x.fecha_envio)}</Text>
                  </View>
                  {!!x.notas_cliente && (
                    <Text style={styles.nota} numberOfLines={2}>
                      “{x.notas_cliente}”
                    </Text>
                  )}
                  {x.usaSimulador && <Text style={styles.productoSub}>Creado con el simulador</Text>}
                  <Text style={styles.enlace}>Ver diseño y descripción →</Text>
                </PressableScale>
              ))}
            </Seccion>
          )}

          <Seccion titulo="Comprobantes de pago" delay={140}>
            {d.pagos.length === 0 ? (
              <Text style={styles.vacio}>Sin comprobantes aún.</Text>
            ) : (
              d.pagos.map((p) => {
                const c = colorEstadoPago(p.estado_pago);
                return (
                  <View key={p.id} style={styles.bloque}>
                    <View style={styles.resumenTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.productoNombre}>
                          {p.tipo_pago} — {formatMoney(p.monto)}
                        </Text>
                        <Text style={styles.productoSub}>{formatFecha(p.fecha_pago, true)}</Text>
                      </View>
                      <Pastilla texto={p.estado_pago} bg={c.bg} fg={c.fg} />
                    </View>
                    {!!p.notas_admin && <Text style={styles.nota}>Notas: {p.notas_admin}</Text>}
                    {!!p.comprobante_url && p.comprobante_url !== TIENDA_FISICA && (
                      <Enlace
                        texto="Ver comprobante →"
                        onPress={() => vm.abrirDetalle({ tipo: 'comprobante', item: p })}
                      />
                    )}
                    {p.comprobante_url === TIENDA_FISICA && (
                      <Text style={styles.productoSub}>Pago en tienda física (sin comprobante)</Text>
                    )}

                    {p.estado_pago === 'PENDIENTE' && (
                      <View style={styles.accionesPago}>
                        <TextInput
                          style={styles.inputNota}
                          placeholder="Notas (opcional, para rechazo)"
                          placeholderTextColor={brandTints.textMuted}
                          value={vm.notasPago[p.id] ?? ''}
                          onChangeText={(t) => vm.editarNotaPago(p.id, t)}
                          editable={!vm.trabajando}
                        />
                        <View style={styles.fila}>
                          <CustomButton
                            title="✓ Aprobar"
                            variant="accent"
                            onPress={() => vm.pedirResolverPago(p, 'APROBADO')}
                            disabled={vm.trabajando}
                            style={styles.flex}
                          />
                          <CustomButton
                            title="✗ Rechazar"
                            variant="danger"
                            onPress={() => vm.pedirResolverPago(p, 'RECHAZADO')}
                            disabled={vm.trabajando}
                            style={styles.flex}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </Seccion>

          <Seccion titulo="Previas de diseño" delay={180}>
            {vm.bannerPrevias && (
              <View
                style={[
                  styles.banner,
                  vm.bannerPrevias.tono === 'ok' && styles.bannerOk,
                  vm.bannerPrevias.tono === 'aviso' && styles.bannerAviso,
                ]}
              >
                <Text
                  style={[
                    styles.bannerTxt,
                    vm.bannerPrevias.tono === 'ok' && { color: brandColors.primary },
                    vm.bannerPrevias.tono === 'aviso' && { color: '#7a3500' },
                  ]}
                >
                  {vm.bannerPrevias.texto}
                </Text>
              </View>
            )}

            {d.previas.length === 0 ? (
              <Text style={styles.vacio}>Aún no se han enviado previas.</Text>
            ) : (
              d.previas.map((p) => {
                const ep = COLOR_ESTADO_PREVIA[vm.estadoDePrevia(p)];
                const url = resolveImageUrl(p.imagen_url);
                return (
                  <PressableScale
                    key={p.id}
                    style={styles.previa}
                    onPress={() => vm.abrirDetalle({ tipo: 'previa', item: p })}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver previa ${p.numero_previa}`}
                  >
                    {url && !esPdf(url) ? (
                      <Image source={{ uri: url }} style={styles.previaImg} resizeMode="cover" />
                    ) : (
                      <View style={[styles.previaImg, styles.previaSinImg]}>
                        <Text style={styles.chevron}>🖼️</Text>
                      </View>
                    )}
                    <View style={styles.previaInfo}>
                      <Text style={styles.productoNombre}>Previa {p.numero_previa}</Text>
                      <Pastilla texto={ep.texto} bg={ep.bg} fg={ep.fg} />
                      <Text style={styles.productoSub}>{formatFecha(p.fecha_subida)}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </PressableScale>
                );
              })
            )}

            {/* Se envía UNA previa a la vez. Si el cliente la rechaza, aparece de nuevo para subir otra. */}
            {vm.puedeEnviarPrevia && (
              <View style={styles.formPrevias}>
                <SelectorPrevia
                  titulo={`Previa ${vm.siguientePrevia}`}
                  archivo={vm.previa}
                  onElegir={vm.elegirPrevia}
                  onQuitar={vm.quitarPrevia}
                  disabled={vm.trabajando}
                />
                <CustomButton
                  title={
                    vm.trabajando
                      ? 'Subiendo imagen…'
                      : vm.siguientePrevia === 1
                        ? 'Enviar previa'
                        : `Enviar otra previa (${vm.siguientePrevia})`
                  }
                  onPress={vm.pedirEnviarPrevia}
                  disabled={vm.trabajando || !vm.previa}
                />
              </View>
            )}
          </Seccion>

          {estado !== 'CANCELADO' && estado !== 'ENVIADO' && (
            <Seccion titulo="Acciones" delay={220}>
              <View style={styles.acciones}>
                {estado === 'EN_PRODUCCION' && (
                  <CustomButton title="Marcar como listo" onPress={vm.pedirMarcarListo} disabled={vm.trabajando} />
                )}
                <CustomButton title="Cancelar pedido" variant="danger" onPress={vm.pedirCancelar} disabled={vm.trabajando} />
              </View>
            </Seccion>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  scroll: { padding: 16, paddingBottom: 40, gap: 14 },
  centro: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  flex: { flex: 1 },
  fila: { flexDirection: 'row', gap: 10 },

  aviso: { padding: 12, borderRadius: 12 },
  avisoOk: { backgroundColor: brandTints.accentSoft },
  avisoErr: { backgroundColor: brandTints.errorSoft },
  avisoTxt: { textAlign: 'center', fontWeight: '600' },
  avisoTxtOk: { color: brandColors.primary },
  avisoTxtErr: { color: brandColors.error },

  card: { backgroundColor: brandColors.white, borderRadius: 16, padding: 16 },
  cardTitulo: { fontSize: 16, fontWeight: '800', color: brandColors.primaryDark, marginBottom: 10 },

  resumenTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  fecha: { fontSize: 12, color: brandTints.textMuted },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: brandTints.surfaceMuted,
  },
  infoLabel: { color: brandTints.textMuted, fontSize: 13 },
  infoValue: {
    color: brandColors.primaryDark,
    fontWeight: '600',
    fontSize: 13,
    flexShrink: 1,
    textAlign: 'right',
  },

  producto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: brandTints.surfaceMuted,
    borderRadius: 10,
    marginBottom: 8,
  },
  productoNombre: { fontSize: 14, fontWeight: '700', color: brandColors.primaryDark },
  productoSub: { fontSize: 12, color: brandTints.textMuted, marginTop: 2 },
  productoPrecio: { fontSize: 14, fontWeight: '800', color: brandColors.primary },
  chevron: { fontSize: 22, color: brandTints.textMuted, fontWeight: '600' },

  bloque: {
    borderWidth: 1,
    borderColor: brandTints.surfaceMuted,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 6,
  },
  bloqueTexto: { marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: brandTints.surfaceMuted, gap: 4 },
  bloqueTitulo: { fontSize: 12, fontWeight: '800', color: brandTints.textMuted },
  bloqueCuerpo: { fontSize: 14, color: brandColors.primaryDark, lineHeight: 20 },
  nota: { fontSize: 13, color: brandTints.textMuted, fontStyle: 'italic' },
  enlace: { color: brandColors.primary, fontWeight: '700', fontSize: 13, marginTop: 4 },

  accionesPago: { marginTop: 8, gap: 10 },
  inputNota: {
    borderWidth: 1,
    borderColor: brandTints.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: brandColors.primaryDark,
  },

  banner: { padding: 12, borderRadius: 10, marginBottom: 10, backgroundColor: brandTints.surfaceMuted },
  bannerOk: { backgroundColor: brandTints.accentSoft },
  bannerAviso: { backgroundColor: '#ffe8d0' },
  bannerTxt: { fontSize: 13, fontWeight: '600', color: brandTints.textMuted },

  previa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: brandTints.surfaceMuted,
    borderRadius: 12,
    marginBottom: 10,
  },
  previaImg: { width: 78, height: 78, borderRadius: 10, backgroundColor: brandTints.surfaceMuted },
  previaSinImg: { alignItems: 'center', justifyContent: 'center' },
  previaInfo: { flex: 1, gap: 4, alignItems: 'flex-start' },

  formPrevias: { marginTop: 8, gap: 12 },

  acciones: { gap: 10 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeTxt: { fontSize: 11, fontWeight: '800' },

  vacio: { color: brandTints.textMuted, fontSize: 13 },
  errorTxt: { color: brandColors.error, fontWeight: '600', textAlign: 'center' },
});
