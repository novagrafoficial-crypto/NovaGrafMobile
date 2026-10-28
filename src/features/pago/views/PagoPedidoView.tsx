import React from 'react';
import { View, Text, ScrollView, Linking, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePagoPedidoViewModel } from '../viewmodels/usePagoPedidoViewModel';
import { AccionesFicha } from '../components/AccionesFicha';
import { DatosBancariosCard } from '../components/DatosBancariosCard';
import { TicketTienda } from '../components/TicketTienda';
import { ComprobantePicker } from '../components/ComprobantePicker';
import { folioDe, money } from '../utils/pagoUtils';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

// Texto del estado del pago en español
const textoEstado = (estado: string) =>
  estado === 'APROBADO' ? 'Aprobado' : estado === 'RECHAZADO' ? 'Rechazado' : 'En verificación';

export const PagoPedidoView = ({ pedidoId }: { pedidoId: number }) => {
  const vm = usePagoPedidoViewModel(pedidoId);

  const cuerpo = () => {
    if (vm.cargando) return <Loading fullScreen />;
    if (vm.error || !vm.pantalla) {
      return (
        <View style={styles.centrado}>
          <Ionicons name="cloud-offline-outline" size={40} color={textColors.muted} />
          <Text style={styles.texto}>{vm.error ?? 'Pedido no encontrado'}</Text>
          <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} style={styles.botonAncho} />
        </View>
      );
    }

    const { pedido, metodo } = vm.pantalla;

    // ── 1) Ya registró su anticipo: solo confirmación ──────────
    if (vm.pagoExistente) {
      const p = vm.pagoExistente;
      const enTienda = p.comprobante_url === 'TIENDA_FISICA';
      return (
        <ScrollView contentContainerStyle={styles.scroll}>
          <FadeInView style={styles.exito}>
            <View style={styles.check}>
              <Ionicons name={enTienda ? 'storefront-outline' : 'checkmark'} size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.exitoTitulo}>{enTienda ? 'Pago en tienda registrado' : 'Comprobante enviado'}</Text>
            <Text style={styles.exitoSub}>
              {enTienda ? 'Paga en tienda mostrando tu ticket.' : 'Estamos verificando tu pago.'}
            </Text>

            {/* Detalle del pago */}
            <View style={styles.detalle}>
              <View style={styles.detalleFila}>
                <Text style={styles.detalleLabel}>Pedido</Text>
                <Text style={styles.detalleValor}>{folioDe(pedido.id)}</Text>
              </View>
              <View style={styles.detalleFila}>
                <Text style={styles.detalleLabel}>Anticipo</Text>
                <Text style={styles.detalleValor}>{money(p.monto)}</Text>
              </View>
              <View style={styles.detalleFila}>
                <Text style={styles.detalleLabel}>Estado</Text>
                <View style={styles.fila}>
                  <Ionicons name="time-outline" size={16} color={textColors.primary} />
                  <Text style={styles.detalleValor}>{textoEstado(p.estado_pago)}</Text>
                </View>
              </View>
            </View>

            {!enTienda && !!p.comprobante_url && (
              <CustomButton
                title="Ver comprobante"
                variant="outline"
                icon={<Ionicons name="document-text-outline" size={20} color={textColors.primary} />}
                onPress={() => Linking.openURL(p.comprobante_url!)}
                style={styles.botonCompleto}
              />
            )}

            {!!p.notas_admin && (
              <View style={styles.notaBox}>
                <Ionicons name="information-circle-outline" size={18} color={textColors.secondary} />
                <Text style={styles.notaTexto}>{p.notas_admin}</Text>
              </View>
            )}
          </FadeInView>

          {/* Solo en tienda: todavía necesita el ticket para pagar en caja */}
          {enTienda && metodo && (
            <>
              <TicketTienda pedido={pedido} cliente={vm.cliente} metodoNombre={metodo.nombre} datos={metodo.datos} />
              <AccionesFicha generando={vm.generandoPdf} error={vm.errorPdf} info={vm.infoPdf} onPdf={vm.descargarPdf} />
            </>
          )}

          <CustomButton
            title="Ir a mis pedidos"
            icon={<Ionicons name="receipt-outline" size={20} color="#FFFFFF" />}
            onPress={vm.irAPedidos}
          />
        </ScrollView>
      );
    }

    // ── 2) El pedido ya avanzó de estado ───────────────────────
    if (!vm.puedePagar) {
      return (
        <View style={styles.centrado}>
          <Ionicons name="checkmark-done-outline" size={40} color={textColors.muted} />
          <Text style={styles.exitoTitulo}>Pedido en proceso</Text>
          <Text style={styles.texto}>Este pedido ya no requiere el pago del anticipo.</Text>
          <CustomButton title="Ir a mis pedidos" onPress={vm.irAPedidos} style={styles.botonAncho} />
        </View>
      );
    }

    // ── 3) Flujo normal: datos de pago + comprobante ───────────
    return (
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <FadeInView>
          <Text style={styles.titulo}>Pedido {folioDe(pedido.id)}</Text>
        </FadeInView>

        {metodo && (
          <View style={styles.fila}>
            <Ionicons name={vm.esTienda ? 'storefront-outline' : 'business-outline'} size={20} color={textColors.primary} />
            <Text style={styles.metodo}>{metodo.nombre}</Text>
          </View>
        )}

        {vm.esTienda ? (
          <TicketTienda pedido={pedido} cliente={vm.cliente} metodoNombre={metodo?.nombre ?? 'Tienda'} datos={metodo?.datos ?? []} />
        ) : (
          <DatosBancariosCard datos={metodo?.datos ?? []} monto={pedido.monto_anticipo} pedidoId={pedido.id} />
        )}

        <AccionesFicha generando={vm.generandoPdf} error={vm.errorPdf} info={vm.infoPdf} onPdf={vm.descargarPdf} />

        {!vm.esTienda && (
          <ComprobantePicker
            archivo={vm.archivo}
            onGaleria={vm.desdeGaleria}
            onArchivo={vm.desdeArchivo}
            onQuitar={vm.quitarArchivo}
          />
        )}

        <CustomInput
          label="Nota adicional (opcional)"
          value={vm.nota}
          onChangeText={vm.setNota}
          placeholder={vm.esTienda ? 'Paso a la tienda el lunes' : 'Le envío el comprobante de mi anticipo'}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />

        {!!vm.errorEnvio && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={brandColors.error} />
            <Text style={styles.errorTexto}>{vm.errorEnvio}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const mostrarBarra = !!vm.pantalla && vm.puedePagar && !vm.pagoExistente;

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Pago del anticipo" onBack={vm.volver} />
      <View style={{ flex: 1 }}>{cuerpo()}</View>

      {mostrarBarra && (
        <View style={styles.barra}>
          <CustomButton
            title={vm.enviando ? 'Procesando...' : vm.esTienda ? 'Confirmar pago en tienda' : 'Subir comprobante'}
            icon={<Ionicons name={vm.esTienda ? 'storefront-outline' : 'cloud-upload-outline'} size={20} color="#FFFFFF" />}
            onPress={vm.enviar}
            disabled={vm.enviando || (!vm.esTienda && !vm.archivo)}
          />
          <CustomButton title="Más tarde" variant="outline" onPress={vm.irAPedidos} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  scroll: { padding: space.lg, paddingBottom: space.xl, gap: space.md },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  texto: { fontFamily: fontFamily.regular, fontSize: 15, color: textColors.secondary, textAlign: 'center' },
  botonAncho: { paddingHorizontal: 28, marginTop: space.sm },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  // Flujo normal
  titulo: { fontFamily: fontFamily.bold, fontSize: 20, color: textColors.primary },
  metodo: { fontFamily: fontFamily.semibold, fontSize: 16, color: textColors.primary },

  // Confirmación
  exito: {
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderColor: surface.border,
  },
  check: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: brandColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  exitoTitulo: { fontFamily: fontFamily.bold, fontSize: 20, color: textColors.primary, textAlign: 'center' },
  exitoSub: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },
  detalle: {
    alignSelf: 'stretch',
    backgroundColor: surface.muted,
    borderRadius: radius.md,
    padding: 14,
    gap: 10,
    marginTop: space.sm,
  },
  detalleFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detalleLabel: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary },
  detalleValor: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  botonCompleto: { alignSelf: 'stretch' },
  notaBox: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: space.sm,
    backgroundColor: surface.muted,
    borderRadius: radius.md,
    padding: space.md,
  },
  notaTexto: { flex: 1, fontFamily: fontFamily.regular, fontSize: 14, color: textColors.primary },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    padding: space.md,
  },
  errorTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, color: brandColors.error },

  // Barra inferior
  barra: {
    backgroundColor: surface.card,
    padding: 14,
    gap: space.sm,
    borderTopWidth: 1,
    borderTopColor: surface.border,
  },
});