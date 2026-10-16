import React from 'react';
import {
  View, Text, ScrollView, Image, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useCheckoutViewModel } from '../viewmodels/useCheckoutViewModel';
import { OptionCard } from '../components/OptionCard';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { brandColors, brandTints } from '@/constants/brand';

const money = (n: number) => `$${n.toFixed(2)}`;

const Seccion = ({ numero, titulo, children }: { numero?: number; titulo: string; children: React.ReactNode }) => (
  <FadeInView style={styles.seccion}>
    <View style={styles.seccionTitulo}>
      {numero && (
        <View style={styles.paso}><Text style={styles.pasoTexto}>{numero}</Text></View>
      )}
      <Text style={styles.seccionTexto}>{titulo}</Text>
    </View>
    {children}
  </FadeInView>
);

const Fila = ({ label, valor, fuerte }: { label: string; valor: string; fuerte?: boolean }) => (
  <View style={styles.fila}>
    <Text style={[styles.filaLabel, fuerte && styles.filaFuerte]}>{label}</Text>
    <Text style={[styles.filaValor, fuerte && styles.filaFuerte]}>{valor}</Text>
  </View>
);

export const CheckoutView = () => {
  const vm = useCheckoutViewModel();

  const cuerpo = () => {
    if (vm.cargando) return <Loading fullScreen />;

    if (vm.errorCarga) {
      return (
        <View style={styles.centrado}>
          <Text style={styles.error}>{vm.errorCarga}</Text>
          <CustomButton title="Reintentar" onPress={vm.reintentar} style={styles.botonAncho} />
        </View>
      );
    }

    if (vm.items.length === 0) {
      return (
        <View style={styles.centrado}>
          <Text style={styles.vacioTitulo}>Tu carrito está vacío</Text>
          <CustomButton title="Ver catálogo" onPress={vm.irAlCatalogo} style={styles.botonAncho} />
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* ── Detalle de la compra ── */}
        <Seccion titulo={`Tu compra (${vm.items.length})`}>
          <View style={styles.caja}>
            {vm.items.map((it) => (
              <View key={it.detalle_id} style={styles.item}>
                <Image
                  source={{ uri: resolveImageUrl(it.imagen_url) || 'https://placehold.co/100x100?text=-' }}
                  style={styles.itemImg}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemNombre} numberOfLines={1}>{it.producto_nombre}</Text>
                  <Text style={styles.itemDetalle}>
                    {it.color ? `${it.color} · ` : ''}{it.cantidad} × {money(it.precio_unitario)}
                  </Text>
                </View>
                <Text style={styles.itemSubtotal}>{money(it.subtotal)}</Text>
              </View>
            ))}
          </View>
        </Seccion>

        {/* ── Entrega ── */}
        <Seccion numero={1} titulo="¿Cómo quieres recibir tu pedido?">
          <View style={styles.chips}>
            {vm.categorias.map((c) => {
              const activa = vm.categoria === c.key;
              return (
                <PressableScale
                  key={c.key}
                  onPress={() => vm.elegirCategoria(c.key)}
                  style={[styles.chip, activa && styles.chipActivo]}
                >
                  <Text style={styles.chipIcono}>{c.icono}</Text>
                  <Text style={[styles.chipTexto, activa && styles.chipTextoActivo]}>{c.label}</Text>
                </PressableScale>
              );
            })}
          </View>

          {vm.categoriaActual && (
            <View style={styles.opciones}>
              {vm.categoriaActual.opciones.map((o) => (
                <OptionCard
                  key={o.id}
                  titulo={o.nombre}
                  descripcion={o.descripcion}
                  derecha={o.costo === 0 ? 'Gratis' : money(o.costo)}
                  seleccionada={vm.entregaId === o.id}
                  onPress={() => vm.elegirEntrega(o.id)}
                />
              ))}
            </View>
          )}

          {vm.esEnvioLocal && (
            <View style={styles.direccion}>
              <CustomInput
                label="Dirección de envío"
                value={vm.direccion}
                onChangeText={vm.setDireccion}
                placeholder="Calle, número, colonia, CP, ciudad"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          )}
        </Seccion>

        {/* ── Pago ── */}
        <Seccion numero={2} titulo="Método de pago">
          <View style={styles.opciones}>
            {vm.metodosPago.map((m) => (
              <OptionCard
                key={m.id}
                titulo={m.nombre}
                descripcion={m.descripcion}
                derecha={m.requiere_comprobante ? 'Con comprobante' : 'Pago directo'}
                seleccionada={vm.pagoId === m.id}
                onPress={() => vm.elegirPago(m.id)}
              />
            ))}
          </View>
          <Text style={styles.nota}>
            Las instrucciones y datos de pago se muestran después de confirmar el pedido.
          </Text>
        </Seccion>

        {/* ── Resumen ── */}
        <Seccion titulo="Resumen">
          <View style={styles.caja}>
            <Fila label="Subtotal productos" valor={money(vm.subtotal)} />
            <Fila label="Costo de envío" valor={money(vm.costoEnvio)} />
            <View style={styles.linea} />
            <Fila label="Total" valor={money(vm.totalGeneral)} fuerte />
            <Fila label="Anticipo (50%)" valor={money(vm.montoAnticipo)} />
            <Fila label="Saldo restante (50%)" valor={money(vm.montoRestante)} />
          </View>
        </Seccion>

        {vm.errorEnvio && (
          <View style={styles.errorBox}><Text style={styles.errorBoxTexto}>{vm.errorEnvio}</Text></View>
        )}
      </ScrollView>
    );
  };

  const mostrarBarra = !vm.cargando && !vm.errorCarga && vm.items.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Finalizar compra" onBack={vm.volver} />
      <View style={{ flex: 1 }}>{cuerpo()}</View>

      {mostrarBarra && (
        <View style={styles.barra}>
          <View>
            <Text style={styles.barraEtiqueta}>Total</Text>
            <Text style={styles.barraTotal}>{money(vm.totalGeneral)}</Text>
          </View>
          <CustomButton
            title={vm.enviando ? 'Creando pedido...' : 'Confirmar pedido'}
            onPress={vm.confirmar}
            disabled={vm.enviando}
            style={{ flex: 1 }}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  scroll: { padding: 16, paddingBottom: 32, gap: 18 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: brandColors.error, textAlign: 'center', fontWeight: '500', marginBottom: 14 },
  vacioTitulo: { fontSize: 18, fontWeight: '800', color: brandColors.primaryDark },
  botonAncho: { paddingHorizontal: 28, marginTop: 12 },

  seccion: { gap: 10 },
  seccionTitulo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paso: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: brandColors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  pasoTexto: { color: brandColors.white, fontSize: 12, fontWeight: '800' },
  seccionTexto: { fontSize: 15, fontWeight: '800', color: brandColors.primaryDark },

  caja: { backgroundColor: brandColors.white, borderRadius: 14, padding: 14, gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemImg: { width: 44, height: 44, borderRadius: 8, backgroundColor: brandTints.surfaceMuted },
  itemNombre: { fontSize: 13, fontWeight: '700', color: brandColors.primaryDark },
  itemDetalle: { fontSize: 11, color: brandTints.textMuted, marginTop: 1 },
  itemSubtotal: { fontSize: 13, fontWeight: '800', color: brandColors.primary },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: 20, backgroundColor: brandColors.white, borderWidth: 1.5, borderColor: brandTints.border,
  },
  chipActivo: { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
  chipIcono: { fontSize: 14 },
  chipTexto: { fontSize: 13, fontWeight: '700', color: brandColors.primaryDark },
  chipTextoActivo: { color: brandColors.white },

  opciones: { gap: 8 },
  direccion: { marginTop: 6 },
  nota: { fontSize: 11, color: brandTints.textMuted },

  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  filaLabel: { fontSize: 13, color: brandTints.textMuted },
  filaValor: { fontSize: 13, fontWeight: '700', color: brandColors.primaryDark },
  filaFuerte: { fontSize: 16, fontWeight: '800', color: brandColors.primaryDark },
  linea: { height: 1, backgroundColor: brandTints.border },

  errorBox: { backgroundColor: brandTints.errorSoft, borderRadius: 12, padding: 12 },
  errorBoxTexto: { color: brandColors.error, fontWeight: '600', textAlign: 'center' },

  barra: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: brandColors.white,
    paddingHorizontal: 16, paddingVertical: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  barraEtiqueta: { fontSize: 12, color: brandTints.textMuted, fontWeight: '600' },
  barraTotal: { fontSize: 22, fontWeight: '800', color: brandColors.primaryDark },
});