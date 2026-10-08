import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePortfolioViewModel } from '@/features/portafolio';
import type { PortfolioItem } from '@/features/portafolio';
import { Loading } from '@/shared/components/Loading';
import { brandColors } from '@/constants/brand';

const MAX_SLIDES = 6;
const AUTOPLAY_MS = 5000;

// Foto de fondo de un trabajo; si no carga, queda el color de marca.
const Slide = ({ item, width, height }: { item: PortfolioItem; width: number; height: number }) => {
  const [failed, setFailed] = useState(false);
  return (
    <View style={{ width, height, backgroundColor: brandColors.primary }}>
      {item.imagenUrl && !failed && (
        <Image
          source={{ uri: item.imagenUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      )}
      {/* Franja oscura arriba para que se lea el encabezado sobre cualquier foto */}
      <View style={styles.franjaSuperior} />
    </View>
  );
};

export const PublicShowcase = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const vm = usePortfolioViewModel('public');
  const listRef = useRef<FlatList<PortfolioItem>>(null);
  const [index, setIndex] = useState(0);

  const items = vm.items.slice(0, MAX_SLIDES);

  const goTo = useCallback(
    (i: number) => {
      listRef.current?.scrollToOffset({ offset: i * width, animated: true });
      setIndex(i);
    },
    [width]
  );

  // Avance automático; se reinicia cada vez que cambia la diapositiva (también al deslizar a mano).
  useEffect(() => {
    if (items.length < 2) return;
    const t = setTimeout(() => goTo((index + 1) % items.length), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, items.length, goTo]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  if (vm.isLoading) return <Loading fullScreen />;

  const actual = items[index];
  const hayTrabajos = items.length > 0;
  const titulo = hayTrabajos
    ? actual?.productoNombre || actual?.descripcion || 'Producto personalizado'
    : 'Tus ideas, hechas producto';
  const subtitulo = hayTrabajos
    ? actual?.productoNombre && actual?.descripcion
      ? actual.descripcion
      : 'Desliza para ver más trabajos.'
    : 'Productos personalizados con tu diseño.';

  return (
    <View style={StyleSheet.absoluteFill}>
      {hayTrabajos ? (
        <FlatList
          ref={listRef}
          data={items}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={onScrollEnd}
          renderItem={({ item }) => <Slide item={item} width={width} height={height} />}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: brandColors.primary }]} />
      )}

      {/* Panel inferior */}
      <View style={[styles.panel, { paddingBottom: insets.bottom + 20 }]}>
        {items.length > 1 && (
          <View style={styles.puntos}>
            {items.map((it, i) => (
              <View key={it.id} style={[styles.punto, i === index && styles.puntoActivo]} />
            ))}
          </View>
        )}

        <Text style={styles.titulo} numberOfLines={2}>
          {titulo}
        </Text>
        <Text style={styles.subtitulo} numberOfLines={2}>
          {subtitulo}
        </Text>

        {items.length > 1 && (
          <View style={styles.miniaturas}>
            {items.map((it, i) => (
              <TouchableOpacity
                key={it.id}
                onPress={() => goTo(i)}
                accessibilityLabel={`Ver trabajo ${i + 1}`}
                style={[styles.miniatura, i === index && styles.miniaturaActiva]}
              >
                {it.imagenUrl && <Image source={{ uri: it.imagenUrl }} style={styles.miniaturaImg} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push('/(auth)/login' as any)}
        >
          <Text style={styles.textoBoton}>Crear mi cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  franjaSuperior: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: brandColors.primaryDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  puntos: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  punto: { width: 10, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  puntoActivo: { width: 26, backgroundColor: brandColors.accent },
  titulo: { color: brandColors.white, fontSize: 28, fontWeight: '800' },
  subtitulo: { color: '#E6F2EF', fontSize: 14, marginTop: 6, marginBottom: 14 },
  miniaturas: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  miniatura: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: brandColors.primary,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  miniaturaActiva: { borderColor: brandColors.accent },
  miniaturaImg: { width: '100%', height: '100%' },
  boton: {
    backgroundColor: brandColors.accent,
    borderRadius: 12,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBoton: { color: brandColors.white, fontSize: 16, fontWeight: '800' },
});