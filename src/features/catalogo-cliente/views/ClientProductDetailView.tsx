import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useClientProductDetailViewModel } from '../viewmodels/useClientProductDetailViewModel';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { Loading } from '@/shared/components/Loading';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { CustomButton } from '@/shared/components/CustomButton';
import { brandColors, brandTints } from '@/constants/brand';

const SIN_IMAGEN = 'https://placehold.co/600x600?text=Sin+imagen';

const primero = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor);

export const ClientProductDetailView = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const id = primero(params.id) as string;
  const colorParam = primero(params.colorSeleccionado);

  const vm = useClientProductDetailViewModel(id, colorParam);

  const regresar = () =>
    router.canGoBack() ? router.back() : router.replace('/(cliente)/productos-base' as any);

  if (vm.loading) {
    return (
      <View style={styles.pantalla}>
        <ScreenHeader title="Detalle" onBack={regresar} />
        <Loading fullScreen />
      </View>
    );
  }

  if (vm.error || !vm.producto) {
    return (
      <View style={styles.pantalla}>
        <ScreenHeader title="Detalle" onBack={regresar} />
        <View style={styles.centrado}>
          <Text style={styles.error}>{vm.error || 'Producto no encontrado'}</Text>
          <CustomButton title="Volver al catálogo" onPress={regresar} style={styles.botonVolver} />
        </View>
      </View>
    );
  }

  const { producto, varianteActiva } = vm;
  const imagen = varianteActiva?.imagen_url || producto.imagen_url || SIN_IMAGEN;

  return (
    <View style={styles.pantalla}>
      <ScreenHeader title={producto.producto_nombre} onBack={regresar} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── IMAGEN: dentro de una tarjeta con margen, completa y sin recortar ── */}
        <FadeInView style={styles.tarjetaImagen}>
          {/* key = url: al cambiar de color la foto vuelve a aparecer con fade */}
          <FadeInView key={imagen} distance={0} duration={260} style={styles.imagenBox}>
            <Image source={{ uri: imagen }} style={styles.imagen} resizeMode="contain" />
          </FadeInView>
        </FadeInView>

        {/* ── COLORES (miniaturas) ── */}
        {vm.coloresUnicos.length > 0 && (
          <FadeInView delay={80} style={styles.tarjeta}>
            <Text style={styles.etiqueta}>
              Color: <Text style={styles.etiquetaValor}>{varianteActiva?.color || '—'}</Text>
            </Text>
            <View style={styles.fila}>
              {vm.coloresUnicos.map((v) => {
                const activo = varianteActiva?.color === v.color;
                return (
                  <PressableScale
                    key={String(v.variante_id)}
                    style={[styles.miniatura, activo && styles.miniaturaActiva]}
                    onPress={() => vm.seleccionarColor(v)}
                    scaleTo={0.9}
                    accessibilityLabel={`Color ${v.color}`}
                  >
                    {v.imagen_url ? (
                      <Image source={{ uri: v.imagen_url }} style={styles.miniaturaImg} />
                    ) : (
                      <Text style={[styles.miniaturaTexto, activo && styles.miniaturaTextoActivo]}>
                        {v.color}
                      </Text>
                    )}
                  </PressableScale>
                );
              })}
            </View>
          </FadeInView>
        )}

        {/* ── INFORMACIÓN ── */}
        <FadeInView delay={140} style={styles.tarjeta}>
          <Text style={styles.titulo}>{producto.producto_nombre}</Text>
          <View style={styles.fila}>
            {producto.categoria && (
              <View style={styles.pildora}>
                <Text style={styles.pildoraTexto}>{producto.categoria}</Text>
              </View>
            )}
            {producto.marca && (
              <View style={[styles.pildora, styles.pildoraNeutra]}>
                <Text style={[styles.pildoraTexto, styles.pildoraNeutraTexto]}>{producto.marca}</Text>
              </View>
            )}
          </View>
          {!!producto.descripcion && <Text style={styles.descripcion}>{producto.descripcion}</Text>}
        </FadeInView>

        {/* ── ATRIBUTOS (talla, material, etc.) ── */}
        {Object.entries(vm.atributosAgrupados).map(([tipo, valores], i) => (
          <FadeInView key={tipo} delay={200 + i * 60} style={styles.tarjeta}>
            <Text style={styles.etiqueta}>
              {tipo}:{' '}
              <Text style={styles.etiquetaValor}>{vm.atributosSeleccionados[tipo] || 'Elige una opción'}</Text>
            </Text>
            <View style={styles.fila}>
              {[...valores].map((valor) => {
                const activo = vm.atributosSeleccionados[tipo] === valor;
                return (
                  <PressableScale
                    key={valor}
                    style={[styles.chip, activo && styles.chipActivo]}
                    onPress={() => vm.seleccionarAtributo(tipo, valor)}
                    scaleTo={0.94}
                  >
                    <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{valor}</Text>
                  </PressableScale>
                );
              })}
            </View>
          </FadeInView>
        ))}

        {/* ── CANTIDAD ── */}
        <FadeInView delay={260} style={[styles.tarjeta, styles.filaCantidad]}>
          <Text style={styles.etiqueta}>Cantidad</Text>
          <View style={styles.contador}>
            <PressableScale style={styles.botonContador} onPress={vm.decrementar} scaleTo={0.85} accessibilityLabel="Quitar uno">
              <Text style={styles.botonContadorTexto}>−</Text>
            </PressableScale>
            <Text style={styles.cantidad}>{vm.cantidad}</Text>
            <PressableScale style={styles.botonContador} onPress={vm.incrementar} scaleTo={0.85} accessibilityLabel="Agregar uno">
              <Text style={styles.botonContadorTexto}>+</Text>
            </PressableScale>
          </View>
        </FadeInView>

        {/* ── TRABAJOS ANTERIORES ── */}
        {vm.portafolio.length > 0 && (
          <FadeInView delay={320} style={styles.tarjeta}>
            <Text style={styles.etiqueta}>✦ Trabajos anteriores con este producto</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fila}>
              {vm.portafolio.map((ref) => (
                <PressableScale
                  key={String(ref.id)}
                  onPress={() => vm.abrirModalPortafolio(ref.imagen_url, ref.descripcion)}
                  scaleTo={0.92}
                >
                  <Image source={{ uri: ref.imagen_url }} style={styles.portafolioMini} />
                </PressableScale>
              ))}
            </ScrollView>
          </FadeInView>
        )}
      </ScrollView>

      {/* ── BARRA INFERIOR FIJA: total + botón ── */}
      <View style={[styles.barra, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {vm.atributosPendientes.length > 0 && (
          <Text style={styles.aviso}>Elige: {vm.atributosPendientes.join(', ')} para continuar.</Text>
        )}
        {!!vm.errorCarrito && <Text style={styles.aviso}>{vm.errorCarrito}</Text>}

        <View style={styles.barraFila}>
          <View>
            <Text style={styles.totalEtiqueta}>Total</Text>
            <Text style={styles.total}>
              ${vm.precioTotal.toFixed(2)} <Text style={styles.moneda}>MXN</Text>
            </Text>
          </View>

          <PressableScale
            style={[
              styles.botonPrincipal,
              vm.agregado && styles.botonAgregado,
              (!vm.puedeAgregar || vm.agregando) && styles.botonDeshabilitado,
            ]}
            disabled={!vm.puedeAgregar || vm.agregando}
            onPress={() => vm.agregarAlCarrito(() => router.push('/(auth)/login' as any))}
          >
            <Text style={styles.botonPrincipalTexto}>
              {vm.agregando ? 'Agregando...' : vm.agregado ? '✓ Agregado' : '🛒 Agregar al carrito'}
            </Text>
          </PressableScale>
        </View>

        {vm.agregado && (
          <FadeInView distance={8} duration={220}>
            <PressableScale style={styles.enlaceCarrito} onPress={() => router.push('/(cliente)/carrito' as any)}>
              <Text style={styles.enlaceCarritoTexto}>Ir al carrito →</Text>
            </PressableScale>
          </FadeInView>
        )}
      </View>

      {/* ── MODAL REAL: cubre toda la pantalla (antes quedaba dentro del scroll) ── */}
      <Modal
        visible={vm.modalPortafolio !== null}
        transparent
        animationType="fade"
        onRequestClose={vm.cerrarModalPortafolio}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalCard}>
            <PressableScale style={styles.modalCerrar} onPress={vm.cerrarModalPortafolio} scaleTo={0.85} accessibilityLabel="Cerrar">
              <Text style={styles.modalCerrarTexto}>✕</Text>
            </PressableScale>
            {vm.modalPortafolio && (
              <>
                <Image source={{ uri: vm.modalPortafolio.url }} style={styles.modalImagen} resizeMode="contain" />
                {!!vm.modalPortafolio.descripcion && (
                  <Text style={styles.modalDescripcion}>{vm.modalPortafolio.descripcion}</Text>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: brandColors.error, textAlign: 'center', fontWeight: '500', marginBottom: 14 },
  botonVolver: { paddingHorizontal: 28 },
  scroll: { padding: 16, paddingBottom: 24, gap: 12 },

  tarjetaImagen: {
    backgroundColor: brandColors.white,
    borderRadius: 20,
    padding: 10,
  },
  imagenBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: brandTints.surfaceMuted,
    overflow: 'hidden',
  },
  imagen: { width: '100%', height: '100%' },

  tarjeta: { backgroundColor: brandColors.white, borderRadius: 16, padding: 16 },
  titulo: { fontSize: 22, fontWeight: '800', color: brandColors.primaryDark, marginBottom: 10 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  descripcion: { fontSize: 14, color: brandTints.textMuted, lineHeight: 21, marginTop: 12 },

  pildora: {
    backgroundColor: brandTints.accentSoft,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pildoraTexto: { fontSize: 12, fontWeight: '700', color: brandColors.primary },
  pildoraNeutra: { backgroundColor: brandTints.surfaceMuted },
  pildoraNeutraTexto: { color: brandTints.textMuted },

  etiqueta: { fontSize: 14, color: brandTints.textMuted, fontWeight: '600', marginBottom: 10 },
  etiquetaValor: { color: brandColors.primaryDark, fontWeight: '800' },

  miniatura: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: brandTints.border,
    backgroundColor: brandTints.surfaceMuted,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniaturaActiva: { borderColor: brandColors.accent },
  miniaturaImg: { width: '100%', height: '100%' },
  miniaturaTexto: { fontSize: 10, color: brandTints.textMuted, textAlign: 'center' },
  miniaturaTextoActivo: { color: brandColors.primary, fontWeight: '700' },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: brandTints.border,
    backgroundColor: brandTints.surfaceMuted,
  },
  chipActivo: { borderColor: brandColors.accent, backgroundColor: brandTints.accentSoft },
  chipTexto: { fontSize: 13, color: brandTints.textMuted },
  chipTextoActivo: { color: brandColors.primary, fontWeight: '700' },

  filaCantidad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contador: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  botonContador: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: brandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonContadorTexto: { color: brandColors.white, fontSize: 20, fontWeight: '700', lineHeight: 22 },
  cantidad: { fontSize: 18, fontWeight: '800', color: brandColors.primaryDark, minWidth: 28, textAlign: 'center' },

  portafolioMini: { width: 76, height: 76, borderRadius: 12, backgroundColor: brandTints.surfaceMuted },

  barra: {
    backgroundColor: brandColors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  barraFila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  totalEtiqueta: { fontSize: 12, color: brandTints.textMuted, fontWeight: '600' },
  total: { fontSize: 22, fontWeight: '800', color: brandColors.primaryDark },
  moneda: { fontSize: 13, fontWeight: '600', color: brandTints.textMuted },
  aviso: { color: brandColors.error, fontSize: 12, textAlign: 'center', marginBottom: 8 },
  botonPrincipal: {
    flex: 1,
    backgroundColor: brandColors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonAgregado: { backgroundColor: brandColors.accent },
  botonDeshabilitado: { opacity: 0.45 },
  botonPrincipalTexto: { color: brandColors.white, fontSize: 15, fontWeight: '800' },
  enlaceCarrito: { alignSelf: 'center', paddingVertical: 10 },
  enlaceCarritoTexto: { color: brandColors.primary, fontWeight: '700', fontSize: 14 },

  modalFondo: {
    flex: 1,
    backgroundColor: brandTints.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: brandColors.white,
    borderRadius: 18,
    padding: 14,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalCerrar: {
    alignSelf: 'flex-end',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brandColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalCerrarTexto: { color: brandColors.white, fontSize: 14, fontWeight: '800' },
  modalImagen: { width: '100%', height: 280, borderRadius: 12, backgroundColor: brandTints.surfaceMuted },
  modalDescripcion: { fontSize: 14, color: brandColors.primaryDark, textAlign: 'center', lineHeight: 20, marginTop: 12 },
});
