import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { brandColors } from '@/constants/brand';

// fullScreen: pantalla completa centrada. Sin fullScreen: indicador en línea.
export const Loading = ({ fullScreen = false }: { fullScreen?: boolean }) => {
  if (fullScreen) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={brandColors.primary} />
      </View>
    );
  }
  return (
    <ActivityIndicator size="large" color={brandColors.primary} style={styles.inline} />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', backgroundColor: brandColors.background },
  inline: { marginVertical: 16 },
});
