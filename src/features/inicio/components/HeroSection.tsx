import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CustomButton } from '@/shared/components/CustomButton';
import { brandColors } from '@/constants/brand';

// Cuando exista la pantalla de registro, cambia RUTA_REGISTRO a '/(auth)/register'.
const RUTA_REGISTRO = '/(auth)/login';
const RUTA_LOGIN = '/(auth)/login';

export const HeroSection = () => {
  const router = useRouter();

  return (
    <View style={styles.hero}>
      <Text style={styles.titulo}>Tus ideas, hechas producto</Text>
      <Text style={styles.texto}>
        Descubre lo que podemos crear para ti. Productos personalizados con tu diseño.
      </Text>
      <CustomButton
        title="Comenzar ahora"
        variant="accent"
        onPress={() => router.push(RUTA_REGISTRO as any)}
      />
      <TouchableOpacity onPress={() => router.push(RUTA_LOGIN as any)} style={styles.enlace}>
        <Text style={styles.textoEnlace}>Ya tengo cuenta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: brandColors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  titulo: { color: brandColors.white, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  texto: { color: '#E6F2EF', fontSize: 15, marginBottom: 20 },
  enlace: { alignSelf: 'center', marginTop: 14 },
  textoEnlace: { color: brandColors.white, fontWeight: '600', fontSize: 14 },
});
