import { contactoApi } from '@/data/api/contactoApi';
import type { ContactoData, ContactoItem, RedSocial, Ubicacion } from '../models/Contacto';

// El backend responde { success, data: [...] }; también aceptamos un arreglo directo.
const lista = (r: any): any[] => {
  const d = r?.data ?? r;
  return Array.isArray(d) ? d : [];
};

const aContactos = (r: any): ContactoItem[] =>
  lista(r)
    .map((c) => ({
      id: Number(c.contacto_id),
      tipo: String(c.tipo_contacto ?? ''),
      valor: String(c.valor_contacto ?? ''),
    }))
    .filter((c) => c.valor !== '');

const aRedes = (r: any): RedSocial[] =>
  lista(r)
    .map((x) => ({
      id: Number(x.red_social_id),
      nombre: String(x.red_social ?? ''),
      url: String(x.url_red_social ?? ''),
    }))
    .filter((x) => x.nombre !== '');

// Como la web, usamos solo la primera ubicación
const aUbicacion = (r: any): Ubicacion | null => {
  const u = lista(r)[0];
  if (!u) return null;
  return {
    direccion: String(u.direccion ?? ''),
    ciudad: String(u.ciudad ?? ''),
    estado: String(u.estado ?? ''),
    pais: String(u.pais ?? ''),
    codigo_postal: String(u.codigo_postal ?? ''),
  };
};

function valorOCero<T>(r: PromiseSettledResult<T>): T | null {
  return r.status === 'fulfilled' ? r.value : null;
}

export const contactoService = {
  // Las 3 peticiones van en paralelo; si una falla, las demás se muestran igual.
  getContacto: async (): Promise<ContactoData> => {
    const resultados = await Promise.allSettled([
      contactoApi.getContactos(),
      contactoApi.getRedes(),
      contactoApi.getUbicaciones(),
    ]);

    if (resultados.every((r) => r.status === 'rejected')) {
      throw new Error('No se pudo conectar con el servidor');
    }

    return {
      contactos: aContactos(valorOCero(resultados[0])),
      redes: aRedes(valorOCero(resultados[1])),
      ubicacion: aUbicacion(valorOCero(resultados[2])),
    };
  },
};