import React, { useCallback } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { PublicHeader } from '@/features/menu-publico';
import { CustomButton } from '@/shared/components/CustomButton';
import { Loading } from '@/shared/components/Loading';
import { PressableScale } from '@/shared/components/PressableScale';
import { TrabajoCard } from '../components/TrabajoCard';
import { TrabajoDetalleSheet } from '../components/TrabajoDetalleSheet';
import { useTrabajosPublicosViewModel } from '../viewmodels/useTrabajosPublicosViewModel';
import type { PortfolioItem } from '../models/PortfolioItem';

const ESCALA = 1.15;

export const TrabajosPublicosView = () => {
  const vm = useTrabajosPublicosViewModel();
  const renderItem = useCallback(
    ({ item }: { item: PortfolioItem }) => <TrabajoCard trabajo={item} onPress={() => vm.abrir(item)} />,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <View style={styles.pantalla}>
      <PublicHeader titulo="Trabajos realizados" />

      {vm.categorias.length > 1 && (
        <View style={styles.chipsBarra}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {['', ...vm.categorias].map((c) => {
              const activo = vm.categoria === c;
              return (
                <PressableScale key={c || 'todo'} style={[styles.chip, activo && styles.chipActivo]} onPress={() => vm.setCategoria(c)} scaleTo={0.95}>
                  <Text style={[styles.chipTexto, activo && { color: '#FFFFFF' }]} maxFontSizeMultiplier={ESCALA}>{c || 'Todos'}</Text>
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
          keyExtractor={(t) => String(t.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ gap: space.md }}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          // Solo dibuja lo que se ve: no se traba aunque haya muchos trabajos
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews
          refreshControl={<RefreshControl refreshing={vm.refrescando} onRefresh={vm.refrescar} tintColor={brandColors.primary} colors={[brandColors.primary]} />}
          ListHeaderComponent={
            <Text style={styles.conteo} maxFontSizeMultiplier={ESCALA}>
              {vm.filtrados.length} {vm.filtrados.length === 1 ? 'trabajo' : 'trabajos'}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.centro}>
              <Ionicons name="images-outline" size={40} color={textColors.muted} />
              <Text style={styles.centroTexto} maxFontSizeMultiplier={ESCALA}>Aún no hay trabajos publicados.</Text>
            </View>
          }
        />
      )}

      <TrabajoDetalleSheet trabajo={vm.seleccionado} onCerrar={vm.cerrar} onEntrar={vm.entrar} onRegistrarse={vm.registrarse} />
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  chipsBarra: { backgroundColor: surface.card, borderBottomWidth: 1, borderBottomColor: surface.border },
  chips: { gap: space.sm, paddingHorizontal: space.lg, paddingVertical: 10 },
  chip: { height: 34, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: surface.border, justifyContent: 'center' },
  chipActivo: { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
  chipTexto: { fontFamily: fontFamily.medium, fontSize: 13, color: textColors.primary },
  lista: { padding: space.lg, paddingBottom: 40, gap: space.md, flexGrow: 1 },
  conteo: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.muted },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xl },
  centroTexto: { fontFamily: fontFamily.regular, fontSize: 15, color: textColors.secondary, textAlign: 'center' },
});
