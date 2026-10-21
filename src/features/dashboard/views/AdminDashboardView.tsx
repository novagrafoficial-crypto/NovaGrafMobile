import { brandColors, brandTints } from '@/constants/brand';
import { CustomButton } from '@/shared/components/CustomButton';
import { FadeInView } from '@/shared/components/FadeInView';
import { Header } from '@/shared/components/Header';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel';

export const AdminDashboardView = () => {
  const vm = useDashboardViewModel();

  return (
    <View style={styles.contenedor}>
      <Header subtitle="Panel de Administrador" />

      <ScrollView contentContainerStyle={styles.contenidoScroll} showsVerticalScrollIndicator={false}>
        <FadeInView style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{vm.iniciales}</Text>
          </View>
          <Text style={styles.saludo}>¡Hola{vm.nombre ? `, ${vm.nombre}` : ''}!</Text>
          {!!vm.correo && <Text style={styles.correo}>{vm.correo}</Text>}
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>Administrador</Text>
          </View>

          <View style={styles.boton}>
            <CustomButton title="Ver mi perfil" onPress={vm.irAPerfil} />
          </View>
        </FadeInView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: brandColors.background },
  contenidoScroll: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: brandColors.white,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: brandColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarTxt: { color: brandColors.white, fontSize: 26, fontWeight: '800' },
  saludo: { fontSize: 20, fontWeight: '800', color: brandColors.primaryDark, textAlign: 'center' },
  correo: { fontSize: 13, color: brandTints.textMuted, marginTop: 2, textAlign: 'center' },
  badge: {
    backgroundColor: brandTints.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 12,
  },
  badgeTxt: { fontSize: 12, color: brandColors.primary, fontWeight: '700' },
  boton: { alignSelf: 'stretch', marginTop: 20 },
});
