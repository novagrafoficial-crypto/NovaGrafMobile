import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/shared/components/PressableScale';
import { PulseView } from '@/shared/components/PulseView';
import { useNotificaciones } from '@/features/notificaciones';
import { brandColors } from '@/constants/brand';
import { fontFamily, radius, space, textColors } from '@/constants/theme';

interface Props {

  nombre?: string;
  busqueda: string;
  onBusqueda: (texto: string) => void;
  categorias: string[];
  categoriaActiva: string;
  onCategoria: (categoria: string) => void;
  onNotificaciones: () => void;
  placeholder?: string;
}

const FONDO = brandColors.primary;
const BLANCO = '#FFFFFF';
const MAX_ESCALA = 1.15;

export const HomeHeader = ({
  nombre,
  busqueda,
  onBusqueda,
  categorias,
  categoriaActiva,
  onCategoria,
  onNotificaciones,
  placeholder = 'Buscar gorras, tazas, playeras…',
}: Props) => {
  const insets = useSafeAreaInsets();
  const opciones = ['', ...categorias];
  const { noLeidas } = useNotificaciones();

  return (
    <View style={[styles.header, { paddingTop: insets.top + space.xs }]}>
      {/* Decoración animada (la que tenía el banner de ofertas): círculos que "respiran" detrás */}
      <PulseView style={[styles.burbuja, styles.burbujaGrande]} scaleTo={1.2} duration={2400} />
      <PulseView style={[styles.burbuja, styles.burbujaChica]} scaleTo={1.25} duration={3000} />
      {/* ── Fila 1: saludo + campana (una sola línea compacta) ── */}
      <View style={styles.filaTop}>
        <Text style={styles.hola} numberOfLines={1} maxFontSizeMultiplier={MAX_ESCALA}>
          {nombre ? `Hola, ${nombre}` : 'Hola'} <Text style={styles.holaSub}></Text>
        </Text>

        <PressableScale
          style={styles.campana}
          onPress={onNotificaciones}
          scaleTo={0.9}
          hitSlop={8}
          accessibilityLabel={noLeidas > 0 ? `Notificaciones, ${noLeidas} sin leer` : 'Notificaciones'}
        >
          <Ionicons name="notifications-outline" size={25} color={BLANCO} />
          {noLeidas > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTexto} maxFontSizeMultiplier={1}>{noLeidas > 9 ? '9+' : noLeidas}</Text>
            </View>
          )}
        </PressableScale>
      </View>

      {/* ── Fila 2: buscador ──────────────────────────────── */}
      <View style={styles.buscador}>
        <Ionicons name="search-outline" size={16} color={textColors.muted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={textColors.muted}
          value={busqueda}
          onChangeText={onBusqueda}
          returnKeyType="search"
          accessibilityLabel="Buscar productos"
          numberOfLines={1}
          maxFontSizeMultiplier={MAX_ESCALA}
        />
        {busqueda.length > 0 && (
          <PressableScale onPress={() => onBusqueda('')} hitSlop={12} scaleTo={0.85} accessibilityLabel="Borrar búsqueda">
            <Ionicons name="close-circle" size={16} color={textColors.muted} />
          </PressableScale>
        )}
      </View>

      {/* ── Fila 3: categorías ────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriasScroll}
        contentContainerStyle={styles.categorias}
      >
        {opciones.map((cat) => {
          const activa = cat === categoriaActiva;
          return (
            <PressableScale
              key={cat || 'todo'}
              style={[styles.chip, activa && styles.chipActivo]}
              onPress={() => onCategoria(cat)}
              scaleTo={0.95}
              hitSlop={{ top: 8, bottom: 8 }} // área de toque cómoda aunque el chip sea pequeño
              accessibilityRole="tab"
              accessibilityState={{ selected: activa }}
            >
              <Text style={[styles.chipTexto, activa && styles.chipTextoActivo]} maxFontSizeMultiplier={MAX_ESCALA}>
                {cat || 'Todo'}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: FONDO,
    paddingHorizontal: space.lg,
    paddingBottom: 10,
    gap: 10,
    overflow: 'hidden',
  },
  burbuja: { position: 'absolute', borderRadius: 999, backgroundColor: brandColors.accent },
  burbujaGrande: { width: 160, height: 160, top: -60, right: -50, opacity: 0.22 },
  burbujaChica: { width: 90, height: 90, bottom: -45, left: '35%', opacity: 0.14 },

  // Fila 1
  filaTop: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 34 },
  hola: { flex: 1, fontFamily: fontFamily.semibold, fontSize: 15, color: BLANCO },
  holaSub: { fontFamily: fontFamily.regular, fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  campana: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: brandColors.error,
    borderWidth: 1.5,
    borderColor: FONDO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTexto: { fontFamily: fontFamily.semibold, color: BLANCO, fontSize: 8, lineHeight: 11 },

  // Fila 2
  buscador: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BLANCO,
    borderRadius: radius.md,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: textColors.primary,
    paddingVertical: 0,
  },

  // Fila 3
  categoriasScroll: { marginHorizontal: -space.lg },
  categorias: { gap: 10, paddingHorizontal: space.lg },
  chip: {
    height: 32,
    paddingHorizontal: 4,
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  chipActivo: { borderBottomColor: BLANCO },
  chipTexto: { fontFamily: fontFamily.medium, fontSize: 15, color: BLANCO  },
  chipTextoActivo: { fontFamily: fontFamily.semibold, color: BLANCO },
});