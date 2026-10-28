import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePagoFinalViewModel } from '../viewmodels/usePagoFinalViewModel';
import { ResumenSaldoCard } from '../components/ResumenSaldoCard';
import { DatosPagoCard } from '../components/DatosPagoCard';
import { SelectorComprobante } from '../components/SelectorComprobante';
import { PagoEnviadoCard } from '../components/PagoEnviadoCard';
import { ModalConfirmarPago } from '../components/ModalConfirmarPago';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { brandColors } from '@/constants/brand';
import { fontFamily, fontSize, fontWeight, iconSize, radius, space, surface, textColors } from '@/constants/theme';

export const PagoFinalView = ({ pedidoId }: { pedidoId: number }) => {
  const vm = usePagoFinalViewModel(pedidoId);
  const insets = useSafeAreaInsets();

  const cuerpo = () => {
    if (vm.cargando) return <Loading fullScreen />;

    if (vm.error || !vm.pantalla) {
      return (
        <View style={styles.centrado}>
          <Ionicons name="cloud-offline-outline" size={44} color={textColors.muted} />
          <Text style={styles.centradoTxt}>{vm.error ?? 'Pedido no encontrado'}</Text>
          <CustomButton title="Reintentar" onPress={vm.reintentar} style={styles.botonAncho} />
        </View>
      );
    }

    const { pedido, metodo, pagado, montoPendiente, pagoFinal } = vm.pantalla;

    // 1) Ya envió su pago final → confirmación
    if (vm.vista === 'enviado') {
      return (
        <ScrollView contentContainerStyle={styles.scroll}>
          <PagoEnviadoCard pedidoId={pedido.id} pago={pagoFinal} />

          {/* Comprobante y recibo */}
          {!!vm.comprobanteUrl && (
            <CustomButton
              title="Ver comprobante"
              variant="outline"
              icon={<Ionicons name="document-text-outline" size={iconSize.md} color={textColors.primary} />}
              onPress={vm.verComprobante}
            />
          )}
          <CustomButton
            title={vm.generandoPdf ? 'Generando recibo…' : 'Descargar recibo (PDF)'}
            variant="outline"
            icon={<Ionicons name="download-outline" size={iconSize.md} color={textColors.primary} />}
            onPress={vm.descargarRecibo}
            disabled={vm.generandoPdf}
          />
          {!!vm.infoPdf && <Text style={styles.info}>{vm.infoPdf}</Text>}
          {!!vm.errorPdf && <Text style={styles.errorPdf}>{vm.errorPdf}</Text>}

          <CustomButton
            title="Ver seguimiento del pedido"
            icon={<Ionicons name="git-commit-outline" size={iconSize.md} color={textColors.inverse} />}
            onPress={vm.irAlPedido}
          />
        </ScrollView>
      );
    }

    // 2) El pedido no está en pago final (aún no llega o ya pasó)
    if (vm.vista === 'noDisponible') {
      return (
        <View style={styles.centrado}>
          <Ionicons name="lock-closed-outline" size={44} color={textColors.muted} />
          <Text style={styles.centradoTitulo}>Pago final no disponible</Text>
          <Text style={styles.centradoTxt}>
            Te avisaremos cuando tu pedido esté listo para liquidar el saldo restante.
          </Text>
          <CustomButton title="Volver al pedido" variant="outline" onPress={vm.volver} style={styles.botonAncho} />
        </View>
      );
    }

    // 3) Flujo normal: resumen → datos de pago → comprobante → nota
    return (
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ResumenSaldoCard pedidoId={pedido.id} total={pedido.total_general} pagado={pagado} pendiente={montoPendiente} />

        {!!vm.rechazoAnterior && (
          <View style={styles.alerta}>
            <Ionicons name="alert-circle-outline" size={iconSize.md} color={brandColors.error} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertaTitulo}>Tu comprobante anterior fue rechazado</Text>
              <Text style={styles.alertaTxt}>
                {vm.rechazoAnterior.notas_admin ?? 'Revisa los datos y vuelve a enviarlo.'}
              </Text>
            </View>
          </View>
        )}

        <Paso numero={1} titulo={vm.esTienda ? 'Acude a la tienda' : 'Realiza tu pago'} />
        <DatosPagoCard
          metodo={metodo}
          modo={vm.modo}
          pedidoId={pedido.id}
          cliente={vm.cliente}
          monto={montoPendiente}
        />

        {!vm.esTienda && (
          <>
            <Paso numero={2} titulo="Sube tu comprobante" />
            <SelectorComprobante
              archivo={vm.archivo}
              onGaleria={vm.desdeGaleria}
              onArchivo={vm.desdeArchivo}
              onQuitar={vm.quitarArchivo}
            />
          </>
        )}

        <Paso numero={vm.esTienda ? 2 : 3} titulo="Nota para Nova Graf (opcional)" />
        <CustomInput
          label="Nota"
          value={vm.nota}
          onChangeText={vm.setNota}
          placeholder={vm.esTienda ? 'Paso a la tienda el viernes' : 'Le envío el comprobante'}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />

        {!!vm.errorEnvio && (
          <View style={styles.alerta}>
            <Ionicons name="close-circle-outline" size={iconSize.md} color={brandColors.error} />
            <Text style={[styles.alertaTxt, { flex: 1 }]}>{vm.errorEnvio}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const mostrarBarra = !!vm.pantalla && vm.vista === 'pagar' && !vm.cargando;

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Pago final" onBack={vm.volver} />
      <View style={{ flex: 1 }}>{cuerpo()}</View>

      <ModalConfirmarPago
        visible={vm.confirmarVisible}
        esTienda={vm.esTienda}
        monto={vm.pantalla?.montoPendiente ?? 0}
        archivo={vm.archivo?.name}
        enviando={vm.enviando}
        onConfirmar={vm.confirmarEnvio}
        onCancelar={vm.cancelarConfirmacion}
      />

      {mostrarBarra && (
        <View style={[styles.barra, { paddingBottom: insets.bottom + space.md }]}>
          <CustomButton
            title={vm.enviando ? 'Enviando…' : vm.esTienda ? 'Confirmar pago en tienda' : 'Enviar comprobante'}
            icon={
              <Ionicons
                name={vm.esTienda ? 'storefront-outline' : 'cloud-upload-outline'}
                size={iconSize.md}
                color={textColors.inverse}
              />
            }
            onPress={vm.enviar}
            disabled={vm.enviando || (!vm.esTienda && !vm.archivo)}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

// Encabezado numerado de cada paso
const Paso = ({ numero, titulo }: { numero: number; titulo: string }) => (
  <View style={styles.paso}>
    <View style={styles.pasoNum}><Text style={styles.pasoNumTxt}>{numero}</Text></View>
    <Text style={styles.pasoTxt}>{titulo}</Text>
  </View>
);

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  scroll: { padding: space.lg, paddingBottom: space.xl, gap: space.md },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  centradoTitulo: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: textColors.primary },
  centradoTxt: { fontSize: fontSize.body, color: textColors.secondary, textAlign: 'center' },
  botonAncho: { paddingHorizontal: 28, marginTop: space.md },
  paso: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm },
  pasoNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: brandColors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  pasoNumTxt: { color: textColors.inverse, fontSize: fontSize.caption, fontWeight: fontWeight.bold },
  pasoTxt: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold, color: textColors.primary },
  alerta: {
    flexDirection: 'row', gap: space.sm, alignItems: 'flex-start',
    backgroundColor: '#FEE2E2', borderRadius: radius.md, padding: space.md,
  },
  alertaTitulo: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: '#991B1B' },
  alertaTxt: { fontSize: fontSize.small, color: '#991B1B', marginTop: 2 },
  info: { fontFamily: fontFamily.medium, fontSize: 13, color: brandColors.primary, textAlign: 'center' },
  errorPdf: { fontFamily: fontFamily.medium, fontSize: 13, color: brandColors.error, textAlign: 'center' },
  barra: {
    backgroundColor: surface.card, paddingHorizontal: space.lg, paddingTop: space.md,
    borderTopWidth: 1, borderTopColor: surface.border,
  },
});