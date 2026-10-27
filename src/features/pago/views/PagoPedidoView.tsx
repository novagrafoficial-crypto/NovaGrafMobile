import React from 'react';
import { AccionesFicha } from '../components/AccionesFicha';
import { View, Text, ScrollView, Linking, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { usePagoPedidoViewModel } from '../viewmodels/usePagoPedidoViewModel';
import { DatosBancariosCard } from '../components/DatosBancariosCard';
import { TicketTienda } from '../components/TicketTienda';
import { ComprobantePicker } from '../components/ComprobantePicker';
import { folioDe, money } from '../utils/pagoUtils';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { FadeInView } from '@/shared/components/FadeInView';
import { brandColors, brandTints } from '@/constants/brand';

export const PagoPedidoView = ({ pedidoId }: { pedidoId: number }) => {
  const vm = usePagoPedidoViewModel(pedidoId);

  const cuerpo = () => {
    if (vm.cargando) return <Loading fullScreen />;
    if (vm.error || !vm.pantalla) {
      return (
        <View style={styles.centrado}>
          <Text style={styles.error}>{vm.error ?? 'Pedido no encontrado'}</Text>
          <CustomButton title="Reintentar" onPress={vm.reintentar} style={styles.botonAncho} />
        </View>
      );
    }

    const { pedido, metodo } = vm.pantalla;

    // 1) Ya registró su anticipo
    if (vm.pagoExistente) {
      const p = vm.pagoExistente;
      const enTienda = p.comprobante_url === 'TIENDA_FISICA';
      return (
        <ScrollView contentContainerStyle={styles.scroll}>
          <FadeInView style={styles.exito}>
            <View style={styles.check}><Text style={styles.checkTxt}>✓</Text></View>
            <Text style={styles.exitoTitulo}>{enTienda ? '¡Pago en tienda registrado!' : '¡Comprobante enviado!'}</Text>
            <Text style={styles.exitoSub}>
              {enTienda ? 'El administrador confirmará tu pago en breve.' : 'El administrador está verificando tu comprobante.'}
            </Text>
            <Text style={styles.folio}>{folioDe(pedido.id)}</Text>
            <Text style={styles.linea}>Anticipo: <Text style={styles.negrita}>{money(p.monto)}</Text></Text>
            <Text style={styles.linea}>Estado: <Text style={styles.negrita}>⏳ {p.estado_pago}</Text></Text>
            {!enTienda && p.comprobante_url && (
              <Text style={styles.link} onPress={() => Linking.openURL(p.comprobante_url!)}>Ver comprobante</Text>
            )}
            {p.notas_admin && <Text style={styles.nota}>📝 Nota del administrador: {p.notas_admin}</Text>}
          </FadeInView>
          {metodo && (
              vm.esTienda ? (
                <TicketTienda pedido={pedido} cliente={vm.cliente} metodoNombre={metodo.nombre} datos={metodo.datos} />
              ) : (
                <DatosBancariosCard datos={metodo.datos} monto={pedido.monto_anticipo} pedidoId={pedido.id} />
              )
            )}
            <AccionesFicha
              generando={vm.generandoPdf}
              error={vm.errorPdf}
              info={vm.infoPdf}
              onPdf={vm.descargarPdf}
            />

          <CustomButton title="Ir a mis pedidos" onPress={vm.irAPedidos} style={{ marginTop: 14 }} />
        </ScrollView>
      );
    }

    // 2) El pedido ya avanzó de estado
    if (!vm.puedePagar) {
      return (
        <View style={styles.centrado}>
          <Text style={styles.exitoTitulo}>Pedido en proceso</Text>
          <Text style={styles.exitoSub}>Estado actual: {pedido.estado}</Text>
          <CustomButton title="Ir a mis pedidos" onPress={vm.irAPedidos} style={styles.botonAncho} />
        </View>
      );
    }

    // 3) Flujo normal: datos según método + comprobante
    return (
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <FadeInView>
          <Text style={styles.titulo}>¡Pedido {folioDe(pedido.id)} creado!</Text>
          <Text style={styles.sub}>
            {vm.esTienda
              ? 'Acude a la tienda con este ticket para pagar tu anticipo.'
              : vm.modo === 'DEPOSITO'
                ? 'Realiza el depósito con estos datos y sube tu ficha.'
                : 'Realiza la transferencia con estos datos y sube tu comprobante.'}
          </Text>
        </FadeInView>

        {metodo && (
          <Text style={styles.metodo}>
            {vm.esTienda ? '🏪' : '🏦'} {metodo.nombre}
          </Text>
        )}
        {metodo?.instrucciones && !vm.esTienda && <Text style={styles.instrucciones}>{metodo.instrucciones}</Text>}

        {vm.esTienda ? (
          <TicketTienda pedido={pedido} cliente={vm.cliente} metodoNombre={metodo?.nombre ?? 'Tienda'} datos={metodo?.datos ?? []} />
        ) : (
          <DatosBancariosCard datos={metodo?.datos ?? []} monto={pedido.monto_anticipo} pedidoId={pedido.id} />
        )}

        <AccionesFicha
          generando={vm.generandoPdf}
          error={vm.errorPdf}
          info={vm.infoPdf}
          onPdf={vm.descargarPdf}
        />

        {!vm.esTienda && (
          <ComprobantePicker
            archivo={vm.archivo}
            onGaleria={vm.desdeGaleria}
            onArchivo={vm.desdeArchivo}
            onQuitar={vm.quitarArchivo}
          />
        )}

        <View>
          <CustomInput
            label="Nota adicional (opcional)"
            value={vm.nota}
            onChangeText={vm.setNota}
            placeholder={vm.esTienda ? 'Ej: Paso a la tienda el lunes' : 'Ej: Le envío el comprobante de mi anticipo'}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        {vm.errorEnvio && <View style={styles.errorBox}><Text style={styles.errorBoxTxt}>{vm.errorEnvio}</Text></View>}
      </ScrollView>
    );
  };

  const mostrarBarra = !!vm.pantalla && vm.puedePagar && !vm.pagoExistente;

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Pago del anticipo" onBack={vm.irAPedidos} />
      <View style={{ flex: 1 }}>{cuerpo()}</View>

      {mostrarBarra && (
        <View style={styles.barra}>
          <CustomButton
            title={vm.enviando ? 'Procesando...' : vm.esTienda ? '🏪 Confirmar pago en tienda' : '📤 Subir comprobante'}
            onPress={vm.enviar}
            disabled={vm.enviando || (!vm.esTienda && !vm.archivo)}
          />
          <CustomButton title="Lo haré después" variant="outline" onPress={vm.irAPedidos} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  scroll: { padding: 16, paddingBottom: 28, gap: 14 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 6 },
  error: { color: brandColors.error, textAlign: 'center', fontWeight: '500' },
  botonAncho: { paddingHorizontal: 28, marginTop: 12 },
  titulo: { fontSize: 20, fontWeight: '800', color: brandColors.primaryDark },
  sub: { fontSize: 13, color: brandTints.textMuted, marginTop: 2 },
  metodo: { fontSize: 15, fontWeight: '800', color: brandColors.primary },
  instrucciones: { fontSize: 13, color: brandColors.primaryDark, backgroundColor: brandTints.accentSoft, padding: 12, borderRadius: 12 },
  exito: { backgroundColor: brandColors.white, borderRadius: 20, padding: 22, alignItems: 'center', gap: 4 },
  check: { width: 64, height: 64, borderRadius: 32, backgroundColor: brandColors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  checkTxt: { color: brandColors.white, fontSize: 32, fontWeight: '800' },
  exitoTitulo: { fontSize: 20, fontWeight: '800', color: brandColors.primaryDark, textAlign: 'center' },
  exitoSub: { fontSize: 13, color: brandTints.textMuted, textAlign: 'center' },
  folio: { fontSize: 18, fontWeight: '800', color: brandColors.primary, marginTop: 8 },
  linea: { fontSize: 13, color: brandTints.textMuted },
  negrita: { fontWeight: '800', color: brandColors.primaryDark },
  link: { marginTop: 6, color: brandColors.primary, fontWeight: '700', textDecorationLine: 'underline' },
  nota: { marginTop: 8, fontSize: 12, color: brandColors.primaryDark, textAlign: 'center' },
  errorBox: { backgroundColor: brandTints.errorSoft, borderRadius: 12, padding: 12 },
  errorBoxTxt: { color: brandColors.error, fontWeight: '600', textAlign: 'center' },
  barra: { backgroundColor: brandColors.white, padding: 14, gap: 8, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
});