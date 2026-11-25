import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ClientProductDetailView } from '../../../features/catalogo-cliente/views/ClientProductDetailView';

export default function ProductoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // key: al cambiar de producto se crea una pantalla nueva (cantidad, capacidad y avisos desde cero)
  return <ClientProductDetailView key={String(id)} />;
}
