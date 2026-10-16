import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { estadoInfo } from '../utils/pedidoUtils';

export const EstadoBadge = ({ estado }: { estado: string }) => {
  const { label, bg, fg } = estadoInfo(estado);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.texto, { color: fg }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  texto: { fontSize: 11, fontWeight: '800' },
});
