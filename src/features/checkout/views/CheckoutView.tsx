import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCheckoutViewModel } from '../viewmodels/useCheckoutViewModel';
import { PasosCheckout } from '../components/PasosCheckout';
import { SelectorCombo } from '../components/SelectoCombo';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { CustomInput } from '@/shared/components/CustomInput';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

const ESCALA = 1.15;
const money = (n: number) => `$${n.toFixed(2)}`;

// ── Piezas pequeñas ─────────────────────────────────────────
const Titulo = ({ texto, sub }: { texto: string; sub?: string }) => (
  <View style={styles.tituloBox}>
    <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>{texto}</Text>
    {!!sub && <Text style={styles.subtitulo} maxFontSizeMultiplier={ESCALA}>{sub}</Text>}
  </View>
);

const Fila = ({ label, valor, fuerte }: { label: string; valor: string; fuerte?: boolean }) => (
  <View style={styles.fila}>
    <Text style={[styles.filaLabel, fuerte && styles.filaFuerte]} maxFontSizeMultiplier={ESCALA}>{label}</Text>
    <Text style={[styles.filaValor, fuerte && styles.filaFuerte]} maxFontSizeMultiplier={ESCALA}>{valor}</Text>
  </View>
);

export const CheckoutView = () => {
  const vm = useCheckoutViewModel();
  const insets = useSafeAreaInsets();

  // ── PASO 1: la compra ─────────────────────────────────────
  const pasoCompra = () => (
    <>
      <Titulo texto="Revisa tu compra" sub={`${vm.items.length} ${vm.items.length === 1 ? 'producto' : 'productos'}`} />
      <View style={styles.tarjeta}>
        {vm.items.map((it, i) => (
          <View key={it.detalle_id} style={[styles.item, i > 0 && styles.itemSeparado]}>
            <View style={styles.itemImgBox}>
              {it.imagen_url ? (
                <Image source={{ uri: resolveImageUrl(it.imagen_url) ?? undefined }} style={styles.itemImg} contentFit="cover" cachePolicy="memory-disk" />
              ) : (
                <Ionicons name="image-outline" size={22} color={textColors.muted} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemNombre} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>{it.producto_nombre}</Text>
              <Text style={styles.itemDetalle} maxFontSizeMultiplier={ESCALA}>
                {it.color ? `${it.color} · ` : ''}{it.cantidad} × {money(it.precio_unitario)}
              </Text>
            </View>
            <Text style={styles.itemSubtotal} maxFontSizeMultiplier={ESCALA}>{money(it.subtotal)}</Text>
          </View>
        ))}
        <View style={styles.linea} />
        <Fila label="Subtotal" valor={money(vm.subtotal)} fuerte />
      </View>
    </>
  );

  // ── PASO 2: entrega ───────────────────────────────────────
  const pasoEntrega = () => (
    <>
      <Titulo texto="¿Cómo quieres recibirlo?" />
      <View style={styles.tipos}>
        {vm.categorias.map((c) => {
          const activa = vm.categoria === c.key;
          return (
            <PressableScale
              key={c.key}
              onPress={() => vm.elegirCategoria(c.key)}
              style={[styles.tipo, activa && styles.tipoActivo]}
              scaleTo={0.96}
              accessibilityRole="radio"
              accessibilityState={{ selected: activa }}
            >
              <Ionicons name={c.icono} size={24} color={activa ? '#FFFFFF' : textColors.primary} />
              <Text style={[styles.tipoTexto, activa && styles.tipoTextoActivo]} maxFontSizeMultiplier={ESCALA}>{c.label}</Text>
            </PressableScale>
          );
        })}
      </View>

      {vm.categoriaActual && (
        <FadeInView key={vm.categoriaActual.key} distance={8} duration={220} style={styles.tarjeta}>
          <SelectorCombo
            etiqueta={
              vm.categoriaActual.key === 'TIENDA' ? 'Tienda' : vm.categoriaActual.key === 'PUNTO_MEDIO' ? 'Punto de entrega' : 'Colonia'
            }
            placeholder="Selecciona una opción"
            opciones={vm.categoriaActual.opciones.map((o) => ({
              id: o.id,
              titulo: o.nombre,
              detalle: o.descripcion,
              derecha: o.costo === 0 ? 'Gratis' : money(o.costo),
            }))}
            seleccionadaId={vm.entregaId}
            onSeleccionar={vm.elegirEntrega}
          />

          {vm.esEnvioLocal && (
            <CustomInput
              label="Dirección de envío"
              value={vm.direccion}
              onChangeText={vm.setDireccion}
              placeholder="Calle, número, colonia y código postal"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          )}
        </FadeInView>
      )}
    </>
  );

  // ── PASO 3: pago ──────────────────────────────────────────
  const pasoPago = () => (
    <>
      <Titulo texto="Forma de Pago" sub={`Hoy pagas el 50%: ${money(vm.montoAnticipo)}`} />
      <View style={styles.tarjeta}>
        <SelectorCombo
          etiqueta="Método de pago"
          placeholder="Selecciona un método"
          opciones={vm.metodosPago.map((m) => ({ id: m.id, titulo: m.nombre }))}
          seleccionadaId={vm.pagoId}
          onSeleccionar={vm.elegirPago}
        />
      </View>
    </>
  );

  // ── PASO 4: resumen y confirmar ───────────────────────────
  const Dato = ({ icono, titulo, valor, detalle, paso }: {
    icono: 'bag-handle-outline' | 'cube-outline' | 'card-outline'; titulo: string; valor: string; detalle?: string | null; paso: number;
  }) => (
    <View style={styles.dato}>
      <View style={styles.datoIcono}><Ionicons name={icono} size={20} color={textColors.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.datoTitulo} maxFontSizeMultiplier={ESCALA}>{titulo}</Text>
        <Text style={styles.datoValor} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>{valor}</Text>
        {!!detalle && <Text style={styles.datoDetalle} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>{detalle}</Text>}
      </View>
      <PressableScale onPress={() => vm.irAPaso(paso)} hitSlop={8} scaleTo={0.94}>
        <Text style={styles.cambiar} maxFontSizeMultiplier={ESCALA}>Cambiar</Text>
      </PressableScale>
    </View>
  );

  const pasoConfirmar = () => (
    <>
      <Titulo texto="Confirma tu pedido" />
      <View style={styles.tarjeta}>
        <Dato icono="bag-handle-outline" titulo="Productos" valor={`${vm.items.length} ${vm.items.length === 1 ? 'producto' : 'productos'}`} paso={0} />
        <View style={styles.linea} />
        <Dato
          icono="cube-outline"
          titulo="Entrega"
          valor={vm.entrega?.nombre ?? '—'}
          detalle={vm.esEnvioLocal ? vm.direccion : vm.entrega?.descripcion}
          paso={1}
        />
        <View style={styles.linea} />
        <Dato icono="card-outline" titulo="Pago" valor={vm.pago?.nombre ?? '—'} paso={2} />
      </View>

      <View style={styles.tarjeta}>
        <Fila label="Subtotal" valor={money(vm.subtotal)} />
        <Fila label="Envío" valor={vm.costoEnvio === 0 ? 'Gratis' : money(vm.costoEnvio)} />
        <View style={styles.linea} />
        <Fila label="Total" valor={money(vm.totalGeneral)} fuerte />
        <View style={styles.anticipo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.anticipoTitulo} maxFontSizeMultiplier={ESCALA}>Pagas hoy (50%)</Text>
            <Text style={styles.anticipoSub} maxFontSizeMultiplier={ESCALA}>Resto al terminar: {money(vm.montoRestante)}</Text>
          </View>
          <Text style={styles.anticipoMonto} maxFontSizeMultiplier={ESCALA}>{money(vm.montoAnticipo)}</Text>
        </View>
      </View>
    </>
  );

  const cuerpo = () => {
    if (vm.cargando) return <Loading fullScreen />;

    if (vm.errorCarga) {
      return (
        <View style={styles.centrado}>
          <Ionicons name="cloud-offline-outline" size={40} color={textColors.muted} />
          <Text style={styles.mensaje}>{vm.errorCarga}</Text>
          <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} style={styles.botonAncho} />
        </View>
      );
    }

    if (vm.items.length === 0) {
      return (
        <View style={styles.centrado}>
          <Ionicons name="cart-outline" size={40} color={textColors.muted} />
          <Text style={styles.vacioTitulo}>Tu carrito está vacío</Text>
          <CustomButton title="Ver productos" onPress={vm.irAlCatalogo} style={styles.botonAncho} />
        </View>
      );
    }

    const contenido = [pasoCompra, pasoEntrega, pasoPago, pasoConfirmar][vm.paso];

    return (
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* key = paso → cada paso entra con su animación */}
        <FadeInView key={vm.paso} distance={12} duration={260} style={{ gap: space.md }}>
          {contenido()}
        </FadeInView>

        {!!vm.errorEnvio && (
          <View style={styles.error}>
            <Ionicons name="alert-circle-outline" size={18} color={brandColors.error} />
            <Text style={styles.errorTexto} maxFontSizeMultiplier={ESCALA}>{vm.errorEnvio}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const mostrarBarra = !vm.cargando && !vm.errorCarga && vm.items.length > 0;

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Finalizar compra" onBack={vm.atras} />
      {mostrarBarra && <PasosCheckout pasos={vm.pasos} actual={vm.paso} />}

      <View style={{ flex: 1 }}>{cuerpo()}</View>

      {mostrarBarra && (
        <View style={[styles.barra, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
          <View style={styles.barraTotal}>
            <Text style={styles.barraEtiqueta} maxFontSizeMultiplier={ESCALA}>Total</Text>
            <Text style={styles.barraMonto} maxFontSizeMultiplier={ESCALA}>{money(vm.totalGeneral)}</Text>
          </View>

          <PressableScale
            style={[styles.boton, vm.enviando && styles.botonOff]}
            onPress={vm.esUltimoPaso ? vm.confirmar : vm.siguiente}
            disabled={vm.enviando}
            scaleTo={0.97}
            accessibilityRole="button"
          >
            <Text style={styles.botonTexto} maxFontSizeMultiplier={ESCALA}>
              {vm.esUltimoPaso ? (vm.enviando ? 'Creando pedido…' : 'Confirmar pedido') : 'Continuar'}
            </Text>
            {!vm.enviando && (
              <Ionicons name={vm.esUltimoPaso ? 'checkmark' : 'arrow-forward'} size={20} color="#FFFFFF" />
            )}
          </PressableScale>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  scroll: { padding: space.lg, paddingBottom: space.xl, gap: space.md },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  mensaje: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },
  vacioTitulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  botonAncho: { paddingHorizontal: 28, marginTop: space.sm },

  // Títulos de cada paso
  tituloBox: { gap: 2 },
  titulo: { fontFamily: fontFamily.bold, fontSize: 20, color: textColors.primary },
  subtitulo: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary },

  // Tarjeta base (todas iguales)
  tarjeta: {
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
    borderWidth: 1,
    borderColor: surface.border,
  },
  linea: { height: 1, backgroundColor: surface.border },

  // Paso 1
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  itemSeparado: { paddingTop: space.md, borderTopWidth: 1, borderTopColor: surface.muted },
  itemImgBox: {
    width: 56, height: 56, borderRadius: radius.md, backgroundColor: surface.muted,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  itemImg: { width: '100%', height: '100%' },
  itemNombre: { fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 20, color: textColors.primary },
  itemDetalle: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary, marginTop: 2 },
  itemSubtotal: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },

  // Paso 2: tipos de entrega
  tipos: { flexDirection: 'row', gap: space.sm },
  tipo: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: surface.border,
    backgroundColor: surface.card,
  },
  tipoActivo: { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
  tipoTexto: { fontFamily: fontFamily.medium, fontSize: 13, color: textColors.primary, textAlign: 'center' },
  tipoTextoActivo: { color: '#FFFFFF' },

  // Paso 4: datos elegidos
  dato: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  datoIcono: {
    width: 38, height: 38, borderRadius: radius.md, backgroundColor: surface.muted,
    alignItems: 'center', justifyContent: 'center',
  },
  datoTitulo: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
  datoValor: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary, marginTop: 1 },
  datoDetalle: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary, marginTop: 2 },
  cambiar: { fontFamily: fontFamily.semibold, fontSize: 13, color: brandColors.primary, paddingTop: 2 },

  // Importes
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  filaLabel: { fontFamily: fontFamily.regular, fontSize: 15, color: textColors.secondary },
  filaValor: { fontFamily: fontFamily.medium, fontSize: 15, color: textColors.primary },
  filaFuerte: { fontFamily: fontFamily.bold, fontSize: 17, color: textColors.primary },
  anticipo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: surface.muted,
    borderRadius: radius.md,
    padding: space.md,
  },
  anticipoTitulo: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  anticipoSub: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary, marginTop: 1 },
  anticipoMonto: { fontFamily: fontFamily.bold, fontSize: 20, color: textColors.primary },

  // Error
  error: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    backgroundColor: '#FEF2F2', borderRadius: radius.md, padding: space.md,
  },
  errorTexto: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, color: brandColors.error },

  // Barra inferior
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: surface.card,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: surface.border,
  },
  barraTotal: { minWidth: 96 },
  barraEtiqueta: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.secondary },
  barraMonto: { fontFamily: fontFamily.bold, fontSize: 20, color: textColors.primary },
  boton: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: brandColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  botonOff: { opacity: 0.6 },
  botonTexto: { fontFamily: fontFamily.semibold, fontSize: 16, color: '#FFFFFF' },
});