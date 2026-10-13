import { nosotrosApi } from '@/data/api/nosotrosApi';
import type { Antecedente, NosotrosData, Proposito, Valor } from '../models/Nosotros';

// El backend a veces responde { data: ... } y a veces el objeto directo (igual que la web).
const extraer = (r: any) => r?.data ?? r;

const aProposito = (r: any): Proposito | null => {
  let d = extraer(r);
  if (Array.isArray(d)) d = d[0];
  return d?.descripcion ? { descripcion: String(d.descripcion) } : null;
};

const aValores = (r: any): Valor[] => {
  const d = extraer(r);
  const lista: any[] = Array.isArray(d) ? d : d ? [d] : [];
  return lista.map((v) => ({
    titulo: v.titulo || v.nombre || 'Valor',
    descripcion: v.descripcion || v.texto || '',
  }));
};

const aAntecedentes = (r: any): Antecedente[] => {
  let d = r;
  if (d?.antecedentes) d = d.antecedentes;
  else if (d?.data) d = d.data;
  return Array.isArray(d)
    ? d.map((a: any) => ({ fecha_evento: String(a.fecha_evento ?? ''), descripcion: String(a.descripcion ?? '') }))
    : [];
};

function valorOCero<T>(r: PromiseSettledResult<T>): T | null {
  return r.status === 'fulfilled' ? r.value : null;
}

export const nosotrosService = {
  // Las 4 peticiones van en paralelo; si una falla, las demás se muestran igual.
  getNosotros: async (): Promise<NosotrosData> => {
    const resultados = await Promise.allSettled([
      nosotrosApi.getMision(),
      nosotrosApi.getVision(),
      nosotrosApi.getValores(),
      nosotrosApi.getAntecedentes(),
    ]);

    // Solo es "error" si fallaron TODAS (por ejemplo, sin conexión)
    if (resultados.every((r) => r.status === 'rejected')) {
      throw new Error('No se pudo conectar con el servidor');
    }

    return {
      mision: aProposito(valorOCero(resultados[0])),
      vision: aProposito(valorOCero(resultados[1])),
      valores: aValores(valorOCero(resultados[2])),
      antecedentes: aAntecedentes(valorOCero(resultados[3])),
    };
  },
};
