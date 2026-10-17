import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useCartViewModel } from '../viewmodels/useCartViewModel';
import { CartItemCard } from '../components/CartItemCard';
import { Header } from '@/shared/components/Header';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { ModalConfirmacion } from '@/shared/components/ModalConfirmacion';
import { brandColors, brandTints } from '@/constants/brand';

export const CartView = () => {
  const vm = useCartViewModel();

  const cuerpo = () => {
    if (vm.loading) return <Loading fullScreen />;

    if (vm.error) {
      return (
        <View style={styles.centrado}>
          <Text style={styles.error}>{vm.error}</Text>
          <CustomButton title="Reintentar" onPress={vm.reintentar} style={styles.botonAncho} />
        </View>
      );
    }

    if (vm.items.length === 0) {
      return (
        <FadeInView style={styles.centrado}>
          <View style={styles.circulo}>
            <Text style={styles.circuloIcono}>🛒</Text>
          </View>
          <Text style={styles.vacioTitulo}>Tu carrito está vacío</Text>
          <Text style={styles.vacioTexto}>Agrega productos desde el catálogo.</Text>
          <CustomButton title="Ver catálogo" onPress={vm.irAlCatalogo} style={styles.botonAncho} />
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
            <Text style={styles.titulo}>Mi carrito ({vm.count})</Text>
            <PressableScale onPress={vm.pedirVaciar} scaleTo={0.94} hitSlop={8}>
              <Text style={styles.vaciar}>Vaciar</Text>
            </PressableScale>
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
      <Header subtitle="Carrito" />

      {vm.mensaje && (
        <FadeInView
          distance={-10}
          duration={250}
          style={[styles.toast, vm.mensaje.ok ? styles.toastOk : styles.toastError]}
        >
          <Text style={[styles.toastTexto, vm.mensaje.ok ? styles.toastTextoOk : styles.toastTextoError]}>
            {vm.mensaje.texto}
          </Text>
        </FadeInView>
      )}

      <View style={styles.contenido}>{cuerpo()}</View>

      {/* Barra inferior con total: solo si hay productos */}
      {!vm.loading && !vm.error && vm.items.length > 0 && (
        <View style={styles.barra}>
          <View>
            <Text style={styles.totalEtiqueta}>Total</Text>
            <Text style={styles.total}>
              ${vm.total.toFixed(2)} <Text style={styles.moneda}>MXN</Text>
            </Text>
          </View>
          <CustomButton title="Proceder al pago" onPress={vm.irAPagar} style={styles.botonPagar} />
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
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  contenido: { flex: 1 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: brandColors.error, textAlign: 'center', fontWeight: '500', marginBottom: 14 },
  botonAncho: { paddingHorizontal: 28, marginTop: 12 },

  circulo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: brandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  circuloIcono: { fontSize: 36 },
  vacioTitulo: { fontSize: 18, fontWeight: '800', color: brandColors.primaryDark },
  vacioTexto: { fontSize: 14, color: brandTints.textMuted, marginTop: 4 },

  lista: { padding: 16, paddingBottom: 24 },
  separador: { height: 12 },
  encabezadoLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titulo: { fontSize: 18, fontWeight: '800', color: brandColors.primaryDark },
  vaciar: { fontSize: 13, fontWeight: '700', color: brandColors.error },

  toast: { marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 12 },
  toastOk: { backgroundColor: brandTints.accentSoft },
  toastError: { backgroundColor: brandTints.errorSoft },
  toastTexto: { textAlign: 'center', fontWeight: '600' },
  toastTextoOk: { color: brandColors.primary },
  toastTextoError: { color: brandColors.error },

  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: brandColors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  totalEtiqueta: { fontSize: 12, color: brandTints.textMuted, fontWeight: '600' },
  total: { fontSize: 22, fontWeight: '800', color: brandColors.primaryDark },
  moneda: { fontSize: 13, fontWeight: '600', color: brandTints.textMuted },
  botonPagar: { flex: 1 },
});