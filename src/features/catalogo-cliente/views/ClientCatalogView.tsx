import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useClientCatalogViewModel } from '../viewmodels/useClientCatalogViewModel';
import { HomeHeader } from '@/features/inicio/components/HomeHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';

export const ClientCatalogView = () => {
  const router = useRouter();
  const vm = useClientCatalogViewModel();

  // Paso 1 del flujo: se oculta cuando el cliente busca o filtra
  const encabezadoLista = !vm.hayFiltros ? (
    <FadeInView style={styles.paso}>
      {/* Círculos decorativos de fondo */}
      <View style={styles.pasoCirculoGrande} />
      <View style={styles.pasoCirculoChico} />

      <View style={styles.pasoFila}>
        <View style={styles.pasoContenido}>
          <Text style={styles.pasoTitulo}>Elige tu producto base</Text>
          <Text style={styles.pasoTexto}>
            Escoge sobre qué quieres plasmar tu diseño. Después pagas el anticipo del 50% y subes tus referencias.
          </Text>
        </View>
        <View style={styles.pasoIcono}>
          <Text style={styles.pasoIconoTexto}>🛍️</Text>
        </View>
      </View>

      {/* Mini progreso del flujo: el primer paso está activo */}
      <View style={styles.progreso}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.progresoBarra, i === 0 && styles.progresoBarraActiva]} />
        ))}
      </View>
    </FadeInView>
  ) : null;

  return (
    <View style={styles.pantalla}>
      <HomeHeader
        busqueda={vm.busqueda}
        onBusqueda={vm.setBusqueda}
        categorias={vm.categorias}
        categoriaActiva={vm.categoriaSeleccionada}
        onCategoria={vm.elegirCategoria}
        onNotificaciones={vm.abrirNotificaciones}
        placeholder="Buscar producto base…"
      />

      {vm.aviso && (
        <FadeInView distance={-10} duration={250} style={styles.toast}>
          <Text style={styles.toastTexto}>{vm.aviso}</Text>
        </FadeInView>
      )}

      {vm.loading ? (
        <Loading fullScreen />
      ) : vm.error ? (
        <View style={styles.centrado}>
          <Text style={styles.error}>{vm.error}</Text>
          <CustomButton title="Reintentar" onPress={vm.reintentar} style={styles.botonReintentar} />
        </View>
      ) : (
        <FlatList
          data={vm.productosFiltrados}
          keyExtractor={(item) => String(item.producto_id)}
          numColumns={2}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={encabezadoLista}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={vm.refreshing}
              onRefresh={vm.refrescar}
              tintColor={brandColors.primary}
              colors={[brandColors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centrado}>
              <Text style={styles.vacioIcono}>🔍</Text>
              <Text style={styles.vacio}>No se encontraron productos base.</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <FadeInView delay={Math.min(index, 6) * 60} style={styles.celda}>
              <PressableScale
                style={styles.card}
                onPress={() => router.push(`/(cliente)/producto/${item.producto_id}` as any)}
                accessibilityRole="button"
                accessibilityLabel={`Elegir ${item.producto_nombre} como producto base`}
              >
                <View style={styles.imagenBox}>
                  <Image
                    source={{ uri: item.imagen_url || 'https://placehold.co/400x400?text=Sin+imagen' }}
                    style={styles.imagen}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.info}>
                  <Text style={styles.nombre} numberOfLines={2}>
                    {item.producto_nombre}
                  </Text>
                  <Text style={styles.precio}>Desde ${Number(item.precio_base || 0).toFixed(2)} MXN</Text>
                  <View style={styles.pildora}>
                    <Text style={styles.textoPildora}>Elegir base</Text>
                  </View>
                </View>
              </PressableScale>
            </FadeInView>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: brandColors.background },
  centrado: { alignItems: 'center', justifyContent: 'center', padding: 24, flex: 1 },
  error: { color: brandColors.error, textAlign: 'center', fontWeight: '500', marginBottom: 14 },
  botonReintentar: { paddingHorizontal: 28 },
  vacioIcono: { fontSize: 36, marginBottom: 8 },
  vacio: { color: brandTints.textMuted, textAlign: 'center' },

  toast: { marginHorizontal: 16, marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: brandTints.accentSoft },
  toastTexto: { textAlign: 'center', fontWeight: '600', color: brandColors.primary },

  // Bloque "Paso 1"
  paso: {
    backgroundColor: brandColors.primary,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  pasoCirculoGrande: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: brandColors.accent,
    opacity: 0.25,
  },
  pasoCirculoChico: {
    position: 'absolute',
    bottom: -24,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: brandColors.accent,
    opacity: 0.18,
  },
  pasoFila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pasoContenido: { flex: 1 },
  pasoPildora: {
    alignSelf: 'flex-start',
    backgroundColor: brandColors.accent,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  pasoPildoraTexto: { fontSize: 11, fontWeight: '800', color: brandColors.primaryDark, letterSpacing: 0.8 },
  pasoTitulo: { fontSize: 22, fontWeight: '800', color: brandColors.white },
  pasoTexto: { fontSize: 13, color: brandTints.accentSoft, lineHeight: 19, marginTop: 6 },
  pasoIcono: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: brandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasoIconoTexto: { fontSize: 26 },
  progreso: { flexDirection: 'row', gap: 6, marginTop: 16 },
  progresoBarra: { flex: 1, height: 5, borderRadius: 3, backgroundColor: brandColors.white, opacity: 0.3 },
  progresoBarraActiva: { backgroundColor: brandColors.accent, opacity: 1 },

  lista: { padding: 10, paddingBottom: 32, flexGrow: 1 },
  celda: { width: '50%', padding: 6 },
  card: {
    backgroundColor: brandColors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagenBox: { width: '100%', aspectRatio: 1, backgroundColor: brandTints.surfaceMuted },
  imagen: { width: '100%', height: '100%' },
  info: { padding: 12 },
  nombre: { fontSize: 14, fontWeight: '700', color: brandColors.primaryDark, minHeight: 36 },
  precio: { fontSize: 13, color: brandColors.primary, fontWeight: '700', marginTop: 4 },
  pildora: {
    alignSelf: 'flex-start',
    backgroundColor: brandTints.accentSoft,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  textoPildora: { fontSize: 11, fontWeight: '700', color: brandColors.primary },
});