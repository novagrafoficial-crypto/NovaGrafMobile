import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { usePortfolioViewModel } from '@/features/portafolio';
import { Loading } from '@/shared/components/Loading';
import { brandColors } from '@/constants/brand';
import { FeaturedProductCard } from './FeaturedProductCard';

export const FeaturedProductsSection = () => {
  const router = useRouter();
  const vm = usePortfolioViewModel('public');
  const irALogin = () => router.push('/(auth)/login' as any);

  // En una página promocional, si no hay nada que mostrar, la sección no aparece.
  if (!vm.isLoading && !vm.error && vm.items.length === 0) return null;

  return (
    <View style={styles.seccion}>
      <Text style={styles.titulo}>Productos destacados</Text>
      <Text style={styles.subtitulo}>Inicia sesión para ver precios y crear el tuyo</Text>

      {vm.isLoading ? (
        <Loading />
      ) : vm.error ? (
        <TouchableOpacity onPress={vm.reload}>
          <Text style={styles.error}>No pudimos cargar los productos. Toca para reintentar.</Text>
        </TouchableOpacity>
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={vm.items.slice(0, 8)}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <FeaturedProductCard item={item} onPress={irALogin} />}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          style={styles.lista}
          contentContainerStyle={styles.listaContenido}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  seccion: { marginBottom: 24 },
  titulo: { fontSize: 20, fontWeight: '700', color: brandColors.primaryDark },
  subtitulo: { fontSize: 13, color: '#555', marginTop: 2, marginBottom: 14 },
  // Sale del padding de 20 del ScrollView para que el carrusel llegue a los bordes.
  lista: { marginHorizontal: -20 },
  listaContenido: { paddingHorizontal: 20 },
  error: { color: brandColors.error, fontWeight: '500', paddingVertical: 12 },
});
