import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useClientCatalogViewModel } from '../viewmodels/useClientCatalogViewModel';
import { Header } from '@/shared/components/Header';
import { Loading } from '@/shared/components/Loading';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';

export const ClientCatalogView = () => {
  const router = useRouter();
  const vm = useClientCatalogViewModel();

  const encabezado = (
    <View style={styles.filtros}>
      <View style={styles.filaFiltros}>
        <TextInput
          style={styles.buscador}
          placeholder="Buscar producto..."
          placeholderTextColor={brandTints.textMuted}
          value={vm.busqueda}
          onChangeText={vm.setBusqueda}
        />
        <PressableScale style={styles.botonCategoria} onPress={vm.alternarMenu} scaleTo={0.97}>
          <Text style={styles.textoCategoria} numberOfLines={1}>
            {vm.categoriaSeleccionada || 'Todas'} {vm.menuAbierto ? '▴' : '▾'}
          </Text>
        </PressableScale>
      </View>

      {vm.menuAbierto && (
        <FadeInView distance={-8} duration={220} style={styles.menu}>
          {['', ...vm.categorias].map((cat) => {
            const activa = cat === vm.categoriaSeleccionada;
            return (
              <PressableScale
                key={cat || 'todas'}
                style={[styles.opcionMenu, activa && styles.opcionMenuActiva]}
                onPress={() => vm.elegirCategoria(cat)}
                scaleTo={0.98}
              >
                <Text style={[styles.textoOpcion, activa && styles.textoOpcionActiva]}>
                  {cat || 'Todas las categorías'}
                </Text>
              </PressableScale>
            );
          })}
        </FadeInView>
      )}
    </View>
  );

  return (
    <View style={styles.pantalla}>
      <Header subtitle="Catálogo" profileRoute="/(cliente)/perfil" />

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
          ListHeaderComponent={encabezado}
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
              <Text style={styles.vacio}>No se encontraron productos.</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <FadeInView delay={Math.min(index, 6) * 60} style={styles.celda}>
              <PressableScale
                style={styles.card}
                onPress={() => router.push(`/(cliente)/producto/${item.producto_id}` as any)}
                accessibilityRole="button"
                accessibilityLabel={`Ver opciones de ${item.producto_nombre}`}
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
                  <Text style={styles.precio}>${Number(item.precio_base || 0).toFixed(2)} MXN</Text>
                  <View style={styles.pildora}>
                    <Text style={styles.textoPildora}>Ver opciones</Text>
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

  filtros: { paddingHorizontal: 6, paddingTop: 12, paddingBottom: 8 },
  filaFiltros: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  buscador: {
    flex: 1,
    backgroundColor: brandColors.white,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    fontSize: 14,
    color: brandColors.primaryDark,
  },
  botonCategoria: {
    backgroundColor: brandColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    maxWidth: '40%',
    justifyContent: 'center',
  },
  textoCategoria: { fontSize: 13, color: brandColors.white, fontWeight: '700' },
  menu: {
    marginTop: 8,
    backgroundColor: brandColors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  opcionMenu: { paddingVertical: 12, paddingHorizontal: 14 },
  opcionMenuActiva: { backgroundColor: brandTints.accentSoft },
  textoOpcion: { fontSize: 14, color: brandColors.primaryDark },
  textoOpcionActiva: { fontWeight: '700', color: brandColors.primary },

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
