import { legalApi } from '@/data/api/legalApi';
import { contactoApi } from '@/data/api/contactoApi';

export interface Politica {
  id: number;
  descripcion: string;
}

const lista = (r: any): any[] => {
  const d = r?.data ?? r;
  return Array.isArray(d) ? d : [];
};

export const legalService = {
  getPoliticas: async (): Promise<Politica[]> =>
    lista(await legalApi.getPoliticas())
      .map((p) => ({ id: Number(p.id), descripcion: String(p.descripcion ?? '').trim() }))
      .filter((p) => !!p.descripcion),

  solicitarEliminacion: async (correo: string, motivo: string): Promise<string> => {
    const r = await legalApi.solicitarEliminacion(correo, motivo);
    return r?.message ?? 'Recibimos tu solicitud.';
  },

  /** Correo de contacto de la empresa (plan B si el servidor no responde) */
  correoEmpresa: async (): Promise<string | null> => {
    try {
      const c = lista(await contactoApi.getContactos()).find((x) =>
        ['email', 'correo'].includes(String(x.tipo_contacto ?? '').toLowerCase())
      );
      return c ? String(c.valor_contacto) : null;
    } catch {
      return null;
    }
  },
};
