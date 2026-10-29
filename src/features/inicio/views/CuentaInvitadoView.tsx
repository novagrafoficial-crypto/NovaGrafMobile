import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import { PublicHeader } from '@/features/menu-publico';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, surface, textColors } from '@/constants/theme';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';

type Icono = ComponentProps<typeof Ionicons>['name'];
const ESCALA = 1.15;

const BENEFICIOS: { icono: Icono; titulo: string; texto: string }[] = [
  { icono: 'pricetags-outline', titulo: 'Precios y ofertas', texto: 'Mira descuentos exclusivos para clientes.' },
  { icono: 'color-palette-outline', titulo: 'Personaliza', texto: 'Sube tu logo o idea para cada producto.' },
  { icono: 'receipt-outline', titulo: 'Sigue tus pedidos', texto: 'Ve en qué etapa va cada uno.' },
  { icono: 'chatbubbles-outline', titulo: 'Chatea con nosotros', texto: 'Resuelve tus dudas sobre tu diseño.' },
];

// Pestaña "Cuenta" sin sesión (como Amazon o Mercado Libre): invita a entrar o registrarse.
export const CuentaInvitadoView = () => {
  const router = useRouter();

  return (
    <View style={styles.pantalla}>
      <PublicHeader titulo="Mi cuenta" conEntrar={false} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FadeInView style={styles.card}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={34} color={brandColors.primary} />
          </View>
          <Text style={styles.cardTitulo} maxFontSizeMultiplier={ESCALA}>Bienvenido a Nova Graf</Text>
          <Text style={styles.cardTexto} maxFontSizeMultiplier={ESCALA}>Inicia sesión o crea tu cuenta para hacer tu primer pedido.</Text>
          <CustomButton title="Iniciar sesión" onPress={() => router.push('/(auth)/login' as any)} style={styles.boton} />
          <CustomButton title="Crear cuenta" variant="outline" onPress={() => router.push('/(auth)/register' as any)} style={styles.boton} />
        </FadeInView>

        <FadeInView delay={100} style={styles.lista}>
          <Text style={styles.listaTitulo} maxFontSizeMultiplier={ESCALA}>Con tu cuenta puedes</Text>
          {BENEFICIOS.map((b, i) => (
            <View key={b.titulo} style={[styles.fila, i < BENEFICIOS.length - 1 && styles.linea]}>
              <View style={styles.filaIcono}>
                <Ionicons name={b.icono} size={19} color={brandColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.filaTitulo} maxFontSizeMultiplier={ESCALA}>{b.titulo}</Text>
                <Text style={styles.filaTexto} maxFontSizeMultiplier={ESCALA}>{b.texto}</Text>
              </View>
            </View>
          ))}
        </FadeInView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: surface.screen },
  header: { backgroundColor: brandColors.primary, paddingHorizontal: space.lg, paddingBottom: space.lg },
  titulo: { fontFamily: fontFamily.bold, fontSize: 22, color: '#FFFFFF' },
  scroll: { padding: space.lg, gap: space.lg, paddingBottom: 40 },
  card: {
    alignItems: 'center',
    gap: space.sm,
    padding: space.xl,
    borderRadius: radius.lg,
    backgroundColor: surface.card,
    borderWidth: 1,
    borderColor: surface.border,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  cardTitulo: { fontFamily: fontFamily.bold, fontSize: 19, color: textColors.primary, textAlign: 'center' },
  cardTexto: { fontFamily: fontFamily.regular, fontSize: 14, color: textColors.secondary, textAlign: 'center', marginBottom: space.sm },
  boton: { alignSelf: 'stretch' },
  lista: { padding: space.lg, borderRadius: radius.lg, backgroundColor: surface.card, borderWidth: 1, borderColor: surface.border },
  listaTitulo: { fontFamily: fontFamily.semibold, fontSize: 16, color: textColors.primary, marginBottom: space.xs },
  fila: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  linea: { borderBottomWidth: 1, borderBottomColor: surface.muted },
  filaIcono: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center' },
  filaTitulo: { fontFamily: fontFamily.semibold, fontSize: 15, color: textColors.primary },
  filaTexto: { fontFamily: fontFamily.regular, fontSize: 13, color: textColors.secondary },
});
