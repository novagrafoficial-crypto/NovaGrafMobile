import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { brandColors } from '@/constants/brand';
import { PUBLIC_MENU } from '@/constants/menu';
import { APP_NAME } from '@/constants/app';
import { CustomButton } from '@/shared/components/CustomButton';

const DRAWER_W = Math.min(Dimensions.get('window').width * 0.75, 320);

interface PublicDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicDrawer = ({ isOpen, onClose }: PublicDrawerProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(-DRAWER_W)).current;

  useEffect(() => {
    Animated.timing(slide, {
      toValue: isOpen ? 0 : -DRAWER_W,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const goLogin = () => {
    onClose();
    router.push('/(auth)/login' as any);
  };

  const goTo = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <Animated.View
      style={[
        styles.drawer,
        {
          width: DRAWER_W,
          paddingTop: insets.top + 24,
          transform: [{ translateX: slide }],
        },
      ]}
    >
      <View>
        <Text style={styles.drawerBrand}>{APP_NAME}</Text>
        {PUBLIC_MENU.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => goTo(item.route)}
          >
            <Text
              style={[
                styles.menuText,
                i === 0 && { color: brandColors.primaryDark, fontWeight: '700' },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <CustomButton title="Iniciar sesión" variant="accent" onPress={goLogin} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
  drawerBrand: {
    fontSize: 24,
    fontWeight: '700',
    color: brandColors.primaryDark,
  },
  drawerSub: { fontSize: 14, color: '#666', marginBottom: 32 },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuText: { fontSize: 16, color: '#555' },
});