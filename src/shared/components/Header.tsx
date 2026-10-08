import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { getInitials } from '@/shared/utils/getInitials';
import { APP_NAME } from '@/constants/app';
import { brandColors } from '@/constants/brand';

interface HeaderProps {
  /** Ruta del perfil según el rol, ej. '/(cliente)/perfil' */
  profileRoute: string;
  /** Texto pequeño bajo la marca (ej. "Panel de Administrador") */
  subtitle?: string;
}

// Un solo header para cliente y administrador.
export const Header = ({ profileRoute, subtitle }: HeaderProps) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.encabezado, { paddingTop: insets.top + 12 }]}>
      <View>
        <Text style={styles.marca}>{APP_NAME}</Text>
        {subtitle && <Text style={styles.subtitulo}>{subtitle}</Text>}
      </View>
      <TouchableOpacity onPress={() => router.push(profileRoute as any)} style={styles.avatar}>
        <Text style={styles.avatarTexto}>{getInitials(user?.nombre)}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  encabezado: {
    backgroundColor: brandColors.primaryDark,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marca: { color: brandColors.white, fontSize: 20, fontWeight: '700' },
  subtitulo: { color: brandColors.accent, fontSize: 12, marginTop: 2, fontWeight: '600' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brandColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: brandColors.white, fontWeight: '700', fontSize: 14 },
});
