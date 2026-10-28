import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useClientCatalogViewModel } from '../viewmodels/useClientCatalogViewModel';
import { HomeHeader } from '@/features/inicio/components/HomeHeader';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';

const ESCALA = 1.15;

export const ClientCatalogView = () => {
  const vm = useClientCatalogViewModel();

  // Título pequeño arriba de la lista: "Todos los productos · 8"
  const encabezadoLista = (
    <View style={styles.encabezado}>
      <Text style={styles.encabezadoTitulo} maxFontSizeMultiplier={ESCALA}>{vm.tituloLista}</Text>
      <Text style={styles.encabezadoContador} maxFontSizeMultiplier={ESCALA}>
        {vm.productosFiltrados.length} {vm.productosFiltrados.length === 1 ? 'producto' : 'productos'}
      </Text>
    </View>
  );

  return (
    <View style={styles.pantalla}>
      <HomeHeader
        nombre={vm.primerNombre}
        busqueda={vm.busqueda}
        onBusqueda={vm.setBusqueda}
        categorias={vm.categorias}
        categoriaActiva={vm.categoriaSeleccionada}
        onCategoria={vm.elegirCategoria}
        onNotificaciones={vm.abrirNotificaciones}
        placeholder="Buscar producto base…"
      />

      {vm.loading ? (
        <Loading fullScreen />
      ) : vm.error ? (
        <View style={styles.centrado}>
          <Ionicons name="cloud-offline-outline" size={40} color={textColors.muted} />
          <Text style={styles.mensaje}>{vm.error}</Text>
          <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} style={styles.botonReintentar} />
        </View>
      ) : (
        <FlatList
          data={vm.productosFiltrados}
          keyExtractor={(item) => String(item.producto_id)}
          numColumns={2}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={encabezadoLista}
          contentContainerStyle={styles.lista}
          // Rendimiento: dibuja pocas tarjetas a la vez
          initialNumToRender={6}
          windowSize={7}
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
              <Ionicons name="search-outline" size={40} color={textColors.muted} />
              <Text style={styles.mensaje}>No encontramos productos con esa búsqueda.</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <FadeInView delay={Math.min(index, 6) * 60} style={styles.celda}>
              <PressableScale
                style={styles.card}
                onPress={() => vm.abrirProducto(item.producto_id)}
                scaleTo={0.97}
                accessibilityRole="button"
                accessibilityLabel={`Elegir ${item.producto_nombre} como producto base`}
              >
                <View style={styles.imagenBox}>
                  {item.imagen_url ? (
                    <Image
                      source={{ uri: item.imagen_url }}
                      style={styles.imagen}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      recyclingKey={String(item.producto_id)}
                      transition={200}
                    />
                  ) : (
                    <Ionicons name="image-outline" size={32} color={textColors.muted} />
                  )}
                  {!!item.categoria && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeTexto} numberOfLines={1} maxFontSizeMultiplier={1}>{item.categoria}</Text>
                    </View>
                  )}
                </View>

                {/* Renglones de alto fijo: todas las tarjetas miden lo mismo */}
                <View style={styles.info}>
                  <Text style={styles.nombre} numberOfLines={2} maxFontSizeMultiplier={ESCALA}>
                    {item.producto_nombre}
                  </Text>
                  <Text style={styles.precio} numberOfLines={1} maxFontSizeMultiplier={ESCALA}>
                    <Text style={styles.desde}>Desde </Text>${Number(item.precio_base || 0).toFixed(2)}
                  </Text>
                  <View style={styles.boton}>
                    <Text style={styles.botonTexto} maxFontSizeMultiplier={ESCALA}>Elegir</Text>
                    <Ionicons name="arrow-forward" size={15} color={textColors.primary} />
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
  pantalla: { flex: 1, backgroundColor: surface.screen },
  centrado: { alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm, flex: 1 },
  mensaje: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center' },
  botonReintentar: { paddingHorizontal: 28, marginTop: space.sm },

  lista: { padding: 10, paddingBottom: 32, flexGrow: 1 },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 4,
  },
  encabezadoTitulo: { fontFamily: fontFamily.bold, fontSize: 18, color: textColors.primary },
  encabezadoContador: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },

  celda: { width: '50%', padding: 6 },
  card: {
    backgroundColor: surface.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: surface.border,
  },
  imagenBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: surface.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagen: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    maxWidth: '85%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeTexto: { fontFamily: fontFamily.semibold, fontSize: 11, color: textColors.primary },

  info: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 10 },
  nombre: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 19, height: 38, color: textColors.primary },
  precio: { fontFamily: fontFamily.bold, fontSize: 17, lineHeight: 24, height: 24, color: textColors.primary, marginTop: 6 },
  desde: { fontFamily: fontFamily.regular, fontSize: 12, color: textColors.secondary },
  boton: {
    marginTop: 10,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: surface.muted,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  botonTexto: { fontFamily: fontFamily.semibold, fontSize: 13, color: textColors.primary },
});