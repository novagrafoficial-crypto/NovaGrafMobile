import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { usePortfolioViewModel } from '@/features/portafolio';
import type { PortfolioItem } from '@/features/portafolio';
import { Loading } from '@/shared/components/Loading';
import { brandColors } from '@/constants/brand';
import { PublicProductCard } from './PublicProductCard';
import { PublicProductDetailModal } from './PublicProductDetailModal';

export const PublicProductList = () => {
  const router = useRouter();
  const vm = usePortfolioViewModel('public');
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  const crearCuenta = () => {
    setSelected(null);
    router.push('/(auth)/login' as any);
  };

  // Sin trabajos que mostrar, la sección no aparece (la página sigue con el resto).
  if (!vm.isLoading && !vm.error && vm.items.length === 0) return null;

  return (
    <View style={styles.seccion}>
      <Text style={styles.titulo}>Tus ideas, hechas producto</Text>
      <Text style={styles.subtitulo}>Trabajos reales de nuestro taller</Text>

      {vm.isLoading ? (
        <Loading />
      ) : vm.error ? (
        <TouchableOpacity onPress={vm.reload}>
          <Text style={styles.error}>No pudimos cargar los trabajos. Toca para reintentar.</Text>
        </TouchableOpacity>
      ) : (
        vm.items.map((item) => (
          <PublicProductCard key={item.id} item={item} onPress={() => setSelected(item)} />
        ))
      )}

      <PublicProductDetailModal
        item={selected}
        onClose={() => setSelected(null)}
        onCreateAccount={crearCuenta}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  seccion: { marginBottom: 8 },
  titulo: { fontSize: 26, fontWeight: '800', color: brandColors.primaryDark },
  subtitulo: { fontSize: 14, color: '#555', marginTop: 4, marginBottom: 18 },
  error: { color: brandColors.error, fontWeight: '500', paddingVertical: 12 },
});