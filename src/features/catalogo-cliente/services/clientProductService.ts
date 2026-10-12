import { catalogApi } from '@/data/api/catalogApi';
import type { ClientProduct } from '../models/ClientProduct';

export const clientProductService = {
  getProducts: async (): Promise<ClientProduct[]> => {
    const data = await catalogApi.getProducts();
    return Array.isArray(data) ? data : data?.productos ?? [];
  },

  solicitarDiseno: (solicitud: {
    producto_id: string | number;
    color: string;
    tamanio: string;
    cantidad: number;
    notas: string;
    imagen_referencia_url?: string;
  }) => catalogApi.requestDesign(solicitud),
};
