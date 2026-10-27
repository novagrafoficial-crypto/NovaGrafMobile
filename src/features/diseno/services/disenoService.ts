import { disenoApi } from '@/data/api/disenoApi';
import { subirArchivo } from '@/data/supabase';
import type { Pedido } from '@/features/pedidos/models/Pedido';
import type { ArchivoDiseno } from '../models/Diseno';

// Mismo bucket y carpeta que la web: disenos/usuario_<id>/...
const subirUno = (archivo: ArchivoDiseno, pedidoId: number, varianteId: number, usuarioId: number) => {
  const ext = (archivo.name.split('.').pop() || 'jpg').toLowerCase();
  const ruta = `disenos/usuario_${usuarioId}/diseno_pedido_${pedidoId}_prod_${varianteId}_${Date.now()}.${ext}`;
  return subirArchivo(ruta, { uri: archivo.uri, mimeType: archivo.mimeType });
};

export const disenoService = {
  // Sube cada archivo a Supabase y, con las URLs, avisa al backend UNA sola vez.
  async enviar(datos: {
    pedido: Pedido;
    archivos: Record<number, ArchivoDiseno>;
    notas: Record<number, string>;
    usuarioId: number;
  }) {
    const { pedido, archivos, notas, usuarioId } = datos;
    const disenos = [];
    for (const d of pedido.detalles) {
      const archivo = archivos[d.variante_id];
      const url = await subirUno(archivo, pedido.id, d.variante_id, usuarioId);
      disenos.push({
        variante_id: d.variante_id,
        archivo_url: url,
        notas_cliente: (notas[d.variante_id] ?? '').trim(),
      });
    }
    return disenoApi.enviarDisenos(pedido.id, disenos);
  },
};