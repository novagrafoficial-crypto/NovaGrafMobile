import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePublicHomeViewModel } from '../viewmodels/usePublicHomeViewModel';
import { homeByRole } from '@/shared/utils/roleRoutes';
import { Loading } from '@/shared/components/Loading';
import { APP_NAME } from '@/constants/app';
import { brandColors } from '@/constants/brand';
import { HeroSection } from '../components/HeroSection';
import { PublicDrawer } from '../components/PublicDrawer';
import { FeaturedProductsSection } from '../components/FeaturedProductsSection';
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
        <TouchableOpacity onPress={vm.openDrawer} hitSlop={12}>
          <Text style={styles.burger}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>{APP_NAME}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <HeroSection />
        <FeaturedProductsSection />
        <ComoFuncionaSection />

        <View style={styles.cardCTA}>
          <Text style={styles.tituloCTA}>Crea tu cuenta gratis</Text>
          <Text style={styles.subtituloCTA}>
            Ve precios, personaliza tu producto y haz tu pedido desde la app.
          </Text>
          <TouchableOpacity
            style={styles.botonCTA}
            onPress={() => router.push('/(auth)/login' as any)}
          >
            <Text style={styles.textoBotonCTA}>Registrarme / Entrar</Text>
          </TouchableOpacity>
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
  cardCTA: { backgroundColor: brandColors.primaryDark, borderRadius: 16, padding: 24 },
  tituloCTA: { color: brandColors.white, fontSize: 20, fontWeight: '700', marginBottom: 6 },
  subtituloCTA: { color: '#E6F2EF', fontSize: 14, marginBottom: 20 },
  botonCTA: {
    backgroundColor: brandColors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  textoBotonCTA: { color: brandColors.white, fontWeight: '700', fontSize: 14 },
});
