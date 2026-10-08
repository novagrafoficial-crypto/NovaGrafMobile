import React, { useState } from 'react';
import { Modal, View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brandColors } from '@/constants/brand';
import type { PortfolioItem } from '@/features/portafolio';
import { splitDescripcion } from '@/features/portafolio/utils/splitDescripcion';

interface Props {
  item: PortfolioItem | null;
  onClose: () => void;
  onCreateAccount: () => void;
}

// Detalle de un trabajo (sin precio): foto completa, nombre, descripción y categoría.
export const PublicProductDetailModal = ({ item, onClose, onCreateAccount }: Props) => {
  const insets = useSafeAreaInsets();
  const [failedId, setFailedId] = useState<PortfolioItem['id'] | null>(null);
  const failed = item !== null && failedId === item.id;

  const partes = splitDescripcion(item?.descripcion);
  const tituloDetalle = item?.productoNombre || partes.titulo || 'Trabajo personalizado';
  const cuerpo =
    (item?.productoNombre ? item?.descripcion : partes.detalle) || 'Hecho a la medida en nuestro taller.';

  return (
    <Modal visible={item !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.fondo}>
        {/* Tocar fuera de la hoja la cierra */}
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Cerrar detalle"
        />

        {item && (
          <View style={[styles.hoja, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Cerrar"
              style={styles.botonCerrar}
            >
              <Text style={styles.textoCerrar}>✕</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.imagenBox}>
                {item.imagenUrl && !failed ? (
                  <Image
                    source={{ uri: item.imagenUrl }}
                    style={styles.imagen}
                    resizeMode="contain"
                    onError={() => setFailedId(item.id)}
                  />
                ) : (
                  <Text style={styles.placeholder}>🖼️</Text>
                )}
              </View>

              <View style={styles.info}>
                <Text style={styles.titulo}>{tituloDetalle}</Text>

                {item.categoriaNombre && (
                  <View style={styles.pastilla}>
                    <Text style={styles.textoPastilla}>{item.categoriaNombre}</Text>
                  </View>
                )}

                <Text style={styles.descripcion}>
                  {cuerpo}
                </Text>

                <Text style={styles.aviso}>
                  Crea tu cuenta para ver el precio y pedir uno igual con tu diseño.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.boton} onPress={onCreateAccount}>
              <Text style={styles.textoBoton}>Crear mi cuenta</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fondo: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  hoja: {
    backgroundColor: brandColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  botonCerrar: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,76,69,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCerrar: { color: brandColors.white, fontSize: 16, fontWeight: '700' },
  imagenBox: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#F4F7F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagen: { width: '100%', height: '100%' },
  placeholder: { fontSize: 48 },
  info: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: '800', color: brandColors.primaryDark },
  pastilla: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F2EF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  textoPastilla: { fontSize: 12, fontWeight: '600', color: brandColors.primaryDark },
  descripcion: { fontSize: 15, lineHeight: 22, color: '#333', marginTop: 14 },
  aviso: { fontSize: 13, color: '#555', marginTop: 16 },
  boton: {
    backgroundColor: brandColors.accent,
    borderRadius: 12,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 8,
  },
  textoBoton: { color: brandColors.white, fontSize: 16, fontWeight: '800' },
});