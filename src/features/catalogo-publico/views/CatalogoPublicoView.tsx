import React, { useCallback } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { CustomButton } from '@/shared/components/CustomButton';
import { Loading } from '@/shared/components/Loading';
import { PressableScale } from '@/shared/components/PressableScale';
import { ProductoPublicoCard } from '../components/ProductoPublicoCard';
import { DetallePublicoSheet } from '../components/DetallePublicoSheet';
import { useCatalogoPublicoViewModel } from '../viewmodels/useCatalogoPublicoViewModel';
import type { ProductoPublico } from '../models/ProductoPublico';

const ESCALA = 1.15;

export const CatalogoPublicoView = () => {
  const vm = useCatalogoPublicoViewModel();
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }: { item: ProductoPublico }) => <ProductoPublicoCard producto={item} onPress={() => vm.abrir(item)} />,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const chips = ['', ...vm.categorias];

  return (
    <View style={styles.pantalla}>
      {/* Encabezado verde con buscador */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.titulo} maxFontSizeMultiplier={ESCALA}>Catálogo</Text>
        <View style={styles.buscador}>
          <Ionicons name="search-outline" size={18} color={textColors.muted} />
          <TextInput
            style={styles.input}
            placeholder="Buscar tazas, playeras, termos…"
            placeholderTextColor={textColors.muted}
            value={vm.busqueda}
            onChangeText={vm.setBusqueda}
            returnKeyType="search"
            maxFontSizeMultiplier={ESCALA}
          />
          {!!vm.busqueda && (
            <PressableScale onPress={() => vm.setBusqueda('')} hitSlop={8} accessibilityLabel="Borrar búsqueda">
              <Ionicons name="close-circle" size={18} color={textColors.muted} />
            </PressableScale>
          )}
        </View>
      </View>

      {/* Categorías */}
      {vm.categorias.length > 0 && (
        <View style={styles.chipsBarra}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {chips.map((c) => {
              const activo = vm.categoria === c;
              return (
                <PressableScale key={c || 'todo'} style={[styles.chip, activo && styles.chipActivo]} onPress={() => vm.setCategoria(c)} scaleTo={0.95}>
                  <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]} maxFontSizeMultiplier={ESCALA}>{c || 'Todo'}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>
      )}

      {vm.cargando ? (
        <Loading fullScreen />
      ) : vm.error ? (
        <View style={styles.centro}>
          <Ionicons name="cloud-offline-outline" size={44} color={textColors.muted} />
          <Text style={styles.centroTexto} maxFontSizeMultiplier={ESCALA}>{vm.error}</Text>
          <CustomButton title="Reintentar" variant="outline" onPress={vm.reintentar} />
        </View>
      ) : (
        <FlatList
          data={vm.filtrados}
          keyExtractor={(p) => String(p.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columna}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          // Solo dibuja lo que se ve: así no se traba con muchos productos
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews
          refreshControl={<RefreshControl refreshing={vm.refrescando} onRefresh={vm.refrescar} tintColor={brandColors.primary} colors={[brandColors.primary]} />}
          ListHeaderComponent={
            <Text style={styles.conteo} maxFontSizeMultiplier={ESCALA}>
              {vm.filtrados.length} {vm.filtrados.length === 1 ? 'producto' : 'productos'}
              {vm.categoria ? ` en ${vm.categoria}` : ''}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.centro}>
              <Ionicons name="search-outline" size={40} color={textColors.muted} />
              <Text style={styles.centroTexto} maxFontSizeMultiplier={ESCALA}>No encontramos productos con ese filtro.</Text>
              <CustomButton title="Ver todo el catálogo" variant="outline" onPress={vm.limpiar} />
            </View>
          }
        />
      )}

      <DetallePublicoSheet detalle={vm.detalle} onCerrar={vm.cerrar} onEntrar={vm.entrar} onRegistrarse={vm.registrarse} />
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  header: { backgroundColor: brandColors.primary, paddingHorizontal: space.lg, paddingBottom: space.md, gap: space.md },
  titulo: { fontFamily: fontFamily.bold, fontSize: 22, color: '#FFFFFF' },
  buscador: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: surface.card,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
  },
  input: { flex: 1, height: '100%', fontFamily: fontFamily.regular, fontSize: 14, color: textColors.primary, paddingVertical: 0 },

  chipsBarra: { backgroundColor: surface.card, borderBottomWidth: 1, borderBottomColor: surface.border },
  chips: { gap: space.sm, paddingHorizontal: space.lg, paddingVertical: 10 },
  chip: { height: 34, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: surface.border, justifyContent: 'center' },
  chipActivo: { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
  chipTexto: { fontFamily: fontFamily.medium, fontSize: 13, color: textColors.primary },
  chipTextoActivo: { color: '#FFFFFF' },

  lista: { padding: space.lg, paddingBottom: 40, gap: space.md, flexGrow: 1 },
  columna: { gap: space.md },
  conteo: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.muted },

  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xl },
  centroTexto: { fontFamily: fontFamily.regular, fontSize: 15, color: textColors.secondary, textAlign: 'center' },
});
