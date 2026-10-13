import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/shared/components/PressableScale';
import { brandColors, brandTints } from '@/constants/brand';

interface Props {
  busqueda: string;
  onBusqueda: (texto: string) => void;
  categorias: string[];
  categoriaActiva: string;
  onCategoria: (categoria: string) => void;
  onNotificaciones: () => void;
  /** Texto del buscador (opcional). Si no se pasa, usa el del Inicio. */
  placeholder?: string;
}

// Encabezado del Inicio: búsqueda + notificaciones + categorías en fila horizontal
export const HomeHeader = ({
  busqueda,
  onBusqueda,
  categorias,
  categoriaActiva,
  onCategoria,
  onNotificaciones,
  placeholder = 'Busca ideas: gorras, tazas, playeras…',
}: Props) => {
  const insets = useSafeAreaInsets();
  const opciones = ['', ...categorias]; // '' = Todo

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <View style={styles.fila}>
        <View style={styles.buscador}>
          <Text style={styles.lupa}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={brandTints.textMuted}
            value={busqueda}
            onChangeText={onBusqueda}
            returnKeyType="search"
            accessibilityLabel={placeholder}
          />
          {busqueda.length > 0 && (
            <PressableScale onPress={() => onBusqueda('')} hitSlop={10} scaleTo={0.85} accessibilityLabel="Borrar búsqueda">
              <Text style={styles.borrar}>✕</Text>
            </PressableScale>
          )}
        </View>

        <PressableScale style={styles.campana} onPress={onNotificaciones} scaleTo={0.88} accessibilityLabel="Notificaciones">
          <Text style={styles.campanaIcono}>🔔</Text>
        </PressableScale>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categorias}>
        {opciones.map((cat) => {
          const activa = cat === categoriaActiva;
          return (
            <PressableScale
              key={cat || 'todo'}
              style={[styles.tab, activa && styles.tabActiva]}
              onPress={() => onCategoria(cat)}
              scaleTo={0.94}
            >
              <Text style={[styles.tabTexto, activa && styles.tabTextoActivo]}>{cat || 'Todo'}</Text>
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { backgroundColor: brandColors.primaryDark, paddingHorizontal: 16 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  buscador: {
    flex: 1,
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: brandColors.white,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  lupa: { fontSize: 12 },
  input: { flex: 1, fontSize: 13, color: brandColors.primaryDark, paddingVertical: 0 },
  borrar: { fontSize: 13, fontWeight: '800', color: brandTints.textMuted },
  campana: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campanaIcono: { fontSize: 14 },
  categorias: { gap: 4, paddingTop: 4 },
  tab: {
    minHeight: 40,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActiva: { borderBottomColor: brandColors.accent },
  tabTexto: { fontSize: 13, fontWeight: '600', color: brandTints.accentSoft },
  tabTextoActivo: { fontWeight: '800', color: brandColors.white },
});