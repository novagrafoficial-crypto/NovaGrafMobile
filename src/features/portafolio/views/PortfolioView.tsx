import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePortfolioViewModel } from '../viewmodels/usePortfolioViewModel';
import { PortfolioCard } from '../components/PortfolioCard';
import { CustomButton } from '@/shared/components/CustomButton';
import { Loading } from '@/shared/components/Loading';
import { brandColors } from '@/constants/brand';

// Catálogo de portafolio: productos personalizados publicados por Nova Graf.
export const PortfolioView = () => {
  const vm = usePortfolioViewModel();

  return (
    <View style={styles.seccion}>
      <Text style={styles.titulo}>Productos personalizados</Text>

      {vm.isLoading ? (
        <Loading />
      ) : vm.error ? (
        <View style={styles.estado}>
          <Text style={styles.error}>{vm.error}</Text>
          <CustomButton title="Reintentar" onPress={vm.reload} style={styles.botonReintentar} />
        </View>
      ) : vm.items.length === 0 ? (
        <View style={styles.estado}>
          <Text style={styles.vacioIcono}>🖼️</Text>
          <Text style={styles.vacio}>No hay productos personalizados publicados aún.</Text>
        </View>
      ) : (
        <View style={styles.cuadricula}>
          {vm.items.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  seccion: { marginBottom: 24 },
  titulo: { fontSize: 18, fontWeight: '700', color: brandColors.primaryDark, marginBottom: 16 },
  cuadricula: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  estado: { alignItems: 'center', paddingVertical: 24 },
  error: { color: brandColors.error, textAlign: 'center', fontWeight: '500', marginBottom: 12 },
  botonReintentar: { paddingHorizontal: 28 },
  vacioIcono: { fontSize: 36, marginBottom: 8 },
  vacio: { color: '#666', textAlign: 'center' },
});
