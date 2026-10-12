import { catalogApi } from '@/data/api/catalogApi';
import type { ClientProductDetail, PortafolioReferencia } from '../models/ClientProductDetail';

export const clientProductDetailService = {
  getProductDetail: (id: string | number): Promise<ClientProductDetail> =>
    catalogApi.getProductDetail(id),

  // El backend devuelve { success, portafolio: [...] } o un arreglo directo.
  getProductPortafolio: async (id: string | number): Promise<PortafolioReferencia[]> => {
    const data = await catalogApi.getProductPortfolio(id);
    const rows = data?.portafolio ?? data;
    return Array.isArray(rows) ? rows.slice(0, 4) : [];
  },

  addToCart: (varianteId: string | number, cantidad: number) =>
    catalogApi.addToCart(varianteId, cantidad),
};
