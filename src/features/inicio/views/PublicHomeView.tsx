import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePublicHomeViewModel } from '../viewmodels/usePublicHomeViewModel';
import { homeByRole } from '@/shared/utils/roleRoutes';
import { Loading } from '@/shared/components/Loading';
import { APP_NAME } from '@/constants/app';
import { brandColors } from '@/constants/brand';
import { PublicDrawer } from '../components/PublicDrawer';
import { PublicProductList } from '../components/PublicProductList';
import { ComoFuncionaSection } from '../components/ComoFuncionaSection';

export const PublicHomeView = () => {
  const vm = usePublicHomeViewModel();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (vm.isLoading) return <Loading fullScreen />;

  // Si ya hay sesión, redirige al panel según rol
  if (vm.user) return <Redirect href={homeByRole(vm.user.rol) as any} />;

  return (
    <View style={{ flex: 1, backgroundColor: brandColors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={vm.openDrawer} hitSlop={12} accessibilityLabel="Abrir menú">
          <Text style={styles.burger}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>{APP_NAME}</Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login' as any)}
          style={styles.botonEntrar}
        >
          <Text style={styles.textoEntrar}>Entrar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* 1. Todos los trabajos, en vertical (al tocar uno se abre su detalle) */}
        <PublicProductList />

        {/* 2. Crear cuenta */}
        <View style={styles.cardCTA}>
          <Text style={styles.tituloCTA}>Crea tu cuenta gratis</Text>
          <Text style={styles.subtituloCTA}>
            Ve precios, personaliza tu producto y haz tu pedido desde la app.
          </Text>
          <TouchableOpacity
            style={styles.botonCTA}
            onPress={() => router.push('/(auth)/login' as any)}
          >
            <Text style={styles.textoBotonCTA}>Crear mi cuenta</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Cómo funciona */}
        <View style={{ marginTop: 28 }}>
          <ComoFuncionaSection />
        </View>
      </ScrollView>

      <PublicDrawer isOpen={vm.isDrawerOpen} onClose={vm.closeDrawer} />

      {vm.isDrawerOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={vm.closeDrawer}
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: brandColors.primaryDark,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  burger: { color: brandColors.white, fontSize: 26 },
  brand: { color: brandColors.white, fontSize: 20, fontWeight: '700' },
  botonEntrar: {
    backgroundColor: brandColors.white,
    borderRadius: 20,
    minHeight: 40,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textoEntrar: { color: brandColors.primaryDark, fontWeight: '800', fontSize: 14 },
  cardCTA: { backgroundColor: brandColors.primaryDark, borderRadius: 18, padding: 24 },
  tituloCTA: { color: brandColors.white, fontSize: 20, fontWeight: '700', marginBottom: 6 },
  subtituloCTA: { color: '#E6F2EF', fontSize: 14, marginBottom: 20 },
  botonCTA: {
    backgroundColor: brandColors.accent,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotonCTA: { color: brandColors.white, fontWeight: '800', fontSize: 16 },
});
