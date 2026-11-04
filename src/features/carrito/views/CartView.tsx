import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartViewModel } from '../viewmodels/useCartViewModel';
import { CartItemCard } from '../components/CartItemCard';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { ModalConfirmacion } from '@/shared/components/ModalConfirmacion';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

const ESCALA = 1.15;

export const CartView = () => {
  const vm = useCartViewModel();
  const piezas = vm.items.reduce((s, i) => s + i.cantidad, 0);

  const cuerpo = () => {
    if (vm.loading) return <Loading fullScreen />;

    if (vm.error) {
      return (
        <View style={styles.centrado}>
          <Ionicons name="cloud-offline-outline" size={40} color={textColors.muted} />
          <Text style={styles.mensaje}>{vm.error}</Text>
          <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} style={styles.botonAncho} />
        </View>
      );
    }

    if (vm.items.length === 0) {
      return (
        <FadeInView style={styles.centrado}>
          <View style={styles.circulo}>
            <Ionicons name="cart-outline" size={40} color={textColors.primary} />
          </View>
          <Text style={styles.vacioTitulo} maxFontSizeMultiplier={ESCALA}>Tu carrito está vacío</Text>
          <Text style={styles.mensaje} maxFontSizeMultiplier={ESCALA}>Elige un producto base y empieza a personalizar.</Text>
          <CustomButton title="Ver productos" onPress={vm.irAlCatalogo} style={styles.botonAncho} />
        </FadeInView>
      );
    }

    return (
      <FlatList
        data={vm.items}
        keyExtractor={(item) => String(item.detalle_id)}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        refreshControl={
          <RefreshControl
            refreshing={vm.refrescando}
            onRefresh={vm.refrescar}
            tintColor={brandColors.primary}
            colors={[brandColors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.encabezadoLista}>
            <View>
              <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>Tus productos</Text>
              <Text style={styles.subtitulo} maxFontSizeMultiplier={ESCALA}>
              </Text>
            </View>
            <PressableScale onPress={vm.pedirVaciar} scaleTo={0.94} hitSlop={8} style={styles.vaciar}>
              <Ionicons name="trash-outline" size={14} color={textColors.primary} />
              <Text style={styles.vaciarTexto} maxFontSizeMultiplier={ESCALA}>Vaciar</Text>
            </PressableScale>
          </View>
        }
        ListFooterComponent={
          // Recordatorio del flujo de personalización
          <View style={styles.nota}>
            <Ionicons name="information-circle-outline" size={18} color={textColors.secondary} />
            <Text style={styles.notaTexto} maxFontSizeMultiplier={ESCALA}>
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <CartItemCard
            item={item}
            index={index}
            ocupado={vm.ocupadoId === item.detalle_id}
            onMas={() => vm.cambiarCantidad(item, item.cantidad + 1)}
            onMenos={() => vm.cambiarCantidad(item, item.cantidad - 1)}
            onEliminar={() => vm.pedirEliminar(item)}
          />
        )}
      />
    );
  };

  return (
    <View style={styles.pantalla}>
      {/* Mismo encabezado verde que el resto de la app (sin flecha: es una pestaña) */}
      <ScreenHeader title="Mi carrito" />

      {vm.mensaje && (
        <FadeInView
          distance={-10}
          duration={250}
          style={[styles.toast, vm.mensaje.ok ? styles.toastOk : styles.toastError]}
        >
          <Ionicons
            name={vm.mensaje.ok ? 'checkmark-circle' : 'alert-circle'}
            size={18}
            color={vm.mensaje.ok ? '#FFFFFF' : brandColors.error}
          />
          <Text style={[styles.toastTexto, !vm.mensaje.ok && { color: brandColors.error }]}>{vm.mensaje.texto}</Text>
        </FadeInView>
      )}

      <View style={styles.contenido}>{cuerpo()}</View>

      {/* Resumen fijo abajo: solo si hay productos */}
      {!vm.loading && !vm.error && vm.items.length > 0 && (
        <View style={[styles.barra, { paddingBottom: space.md }]}>
          {/* Ahorro por ofertas (solo si hay) */}
          {vm.ahorro > 0 && (
            <View style={styles.resumenFila}>
              <View style={styles.ahorroEtiqueta}>
                <Ionicons name="pricetag-outline" size={15} color="#166534" />
                <Text style={styles.ahorroTexto} maxFontSizeMultiplier={ESCALA}>Ahorro por ofertas</Text>
              </View>
              <Text style={styles.ahorroTexto} maxFontSizeMultiplier={ESCALA}>−${vm.ahorro.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.resumenFila}>
            <Text style={styles.resumenEtiqueta} maxFontSizeMultiplier={ESCALA}>Total ({piezas} {piezas === 1 ? 'pieza' : 'piezas'})</Text>
            <Text style={styles.total} maxFontSizeMultiplier={ESCALA}>
              ${vm.total.toFixed(2)} <Text style={styles.moneda}>MXN</Text>
            </Text>
          </View>
          <View style={styles.resumenFila}>
            <Text style={styles.anticipoEtiqueta} maxFontSizeMultiplier={ESCALA}>Anticipo 50% (sin envío)</Text>
            <Text style={styles.anticipo} maxFontSizeMultiplier={ESCALA}>${(vm.total / 2).toFixed(2)}</Text>
          </View>

          <PressableScale style={styles.botonPagar} onPress={vm.irAPagar} scaleTo={0.97} accessibilityRole="button">
            <Text style={styles.botonPagarTexto} maxFontSizeMultiplier={ESCALA}>Continuar al pago</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </PressableScale>
        </View>
      )}

      <ModalConfirmacion
        visible={vm.itemAEliminar !== null}
        titulo="Eliminar producto"
        mensaje={`¿Eliminar "${vm.itemAEliminar?.producto_nombre ?? ''}" del carrito?`}
        onConfirmar={vm.confirmarEliminar}
        onCancelar={vm.cancelarEliminar}
      />

      <ModalConfirmacion
        visible={vm.vaciarVisible}
        titulo="Vaciar carrito"
        mensaje="¿Quitar todos los productos del carrito?"
        textoConfirmar="Sí, vaciar"
        onConfirmar={vm.confirmarVaciar}
        onCancelar={vm.cancelarVaciar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  contenido: { flex: 1 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  mensaje: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },
  botonAncho: { paddingHorizontal: 28, marginTop: space.sm },

  // Vacío
  circulo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: surface.card,
    borderWidth: 1,
    borderColor: surface.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  vacioTitulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },

  // Lista
  lista: { padding: space.lg, paddingBottom: space.lg },
  separador: { height: space.md },
  encabezadoLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  titulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  subtitulo: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary, marginTop: 1 },
  vaciar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: surface.card,
    borderWidth: 1,
    borderColor: surface.border,
  },
  vaciarTexto: { fontFamily: fontFamily.medium, fontSize: 12, color: textColors.primary },
  nota: {
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'flex-start',
    marginTop: space.lg,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: surface.muted,
  },
  notaTexto: { flex: 1, fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 19, color: textColors.secondary },

  // Avisos
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: space.lg,
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.md,
  },
  toastOk: { backgroundColor: textColors.primary },
  toastError: { backgroundColor: '#FEF2F2' },
  toastTexto: { fontFamily: fontFamily.medium, fontSize: 13, color: '#FFFFFF' },

  // Resumen inferior
  barra: {
    backgroundColor: surface.card,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: surface.border,
  },
  resumenFila: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  ahorroEtiqueta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ahorroTexto: { fontFamily: fontFamily.semibold, fontSize: 14, color: '#166534' },
  resumenEtiqueta: { fontFamily: fontFamily.medium, fontSize: 14, color: textColors.primary },
  total: { fontFamily: fontFamily.bold, fontSize: 22, color: textColors.primary },
  moneda: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.secondary },
  anticipoEtiqueta: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
  anticipo: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  botonPagar: {
    marginTop: space.sm,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: brandColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  botonPagarTexto: { fontFamily: fontFamily.semibold, fontSize: 16, color: '#FFFFFF' },
});