import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { brandColors, brandTints } from '@/constants/brand';
import { PUBLIC_MENU } from '@/constants/menu';
import { APP_NAME } from '@/constants/app';
import { CustomButton } from '@/shared/components/CustomButton';
import { PressableScale } from '@/shared/components/PressableScale';

const DRAWER_W = Math.min(Dimensions.get('window').width * 0.75, 320);

interface PublicDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicDrawer = ({ isOpen, onClose }: PublicDrawerProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // 0 = cerrado, 1 = abierto. Un solo valor mueve el menú Y oscurece el fondo.
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isOpen ? 1 : 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [isOpen, progress]);

  const goTo = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <>
      {/* Fondo oscuro con fade; solo recibe toques mientras el menú está abierto */}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFill, styles.fondo, { opacity: progress }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar menú" />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_W,
            paddingTop: insets.top + 24,
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-DRAWER_W, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View>
          <Text style={styles.drawerBrand}>{APP_NAME}</Text>
          {PUBLIC_MENU.map((item, i) => (
            <PressableScale
              key={item.label}
              style={styles.menuItem}
              onPress={() => goTo(item.route)}
              scaleTo={0.97}
            >
              <Text style={[styles.menuText, i === 0 && styles.menuTextActivo]}>{item.label}</Text>
            </PressableScale>
          ))}
        </View>
        <CustomButton title="Iniciar sesión" variant="accent" onPress={() => goTo('/(auth)/login')} />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  fondo: { backgroundColor: brandTints.overlay, zIndex: 5 },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: brandColors.white,
    padding: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  drawerBrand: { fontSize: 24, fontWeight: '800', color: brandColors.primaryDark, marginBottom: 12 },
  menuItem: { paddingVertical: 16, borderBottomWidth: 1, borderColor: brandTints.surfaceMuted },
  menuText: { fontSize: 16, color: brandTints.textMuted },
  menuTextActivo: { color: brandColors.primary, fontWeight: '700' },
});
