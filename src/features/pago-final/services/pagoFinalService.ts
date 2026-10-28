import { pagoApi } from '@/data/api/pagoApi';
import { subirArchivo } from '@/data/supabase';
import { pagoService } from '@/features/pago/services/pagoService';
import type { ArchivoComprobante, PantallaPagoFinal } from '../models/PagoFinal';

const redondear = (n: number) => Math.round(n * 100) / 100;

// Misma convención de nombre que la web (PagoFinal.jsx): PAGO_FINAL_Pedido_..._Cliente_...
const subirComprobante = (
  archivo: ArchivoComprobante, pedidoId: number, usuarioId: number, nombreCliente: string
): Promise<string> => {
  const limpio =
    nombreCliente.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'cliente';
  const ext = (archivo.name.split('.').pop() || 'jpg').toLowerCase();
  const fecha = new Date().toISOString().split('T')[0];
  const ruta = `comprobantes/usuario_${usuarioId}/PAGO_FINAL_Pedido_${pedidoId}_Cliente_${limpio}_${fecha}_${Date.now()}.${ext}`;
  return subirArchivo(ruta, { uri: archivo.uri, mimeType: archivo.mimeType });
};

export const pagoFinalService = {
  getPantalla: async (pedidoId: number): Promise<PantallaPagoFinal> => {
    // Reutiliza la carga del anticipo (pedido + método de pago con datos bancarios)
    const { pedido, metodo } = await pagoService.getPantalla(pedidoId);

    const pagado = redondear(
      pedido.pagos.filter((p) => p.estado_pago === 'APROBADO').reduce((s, p) => s + p.monto, 0)
    );
    const montoPendiente = Math.max(redondear(pedido.total_general - pagado), 0);
    // El más reciente (si el admin rechazó uno, el cliente puede haber subido otro)
    const pagoFinal = [...pedido.pagos].reverse().find((p) => p.tipo_pago !== 'ANTICIPO') ?? null;

    return { pedido, metodo, pagado, montoPendiente, pagoFinal };
  },

  // archivo = null → pago en tienda (se guarda como 'TIENDA_FISICA', igual que la web)
  registrar: async (datos: {
    pantalla: PantallaPagoFinal; archivo: ArchivoComprobante | null; nota: string;
    usuarioId: number; nombreCliente: string;
  }) => {
    const { pantalla, archivo, nota, usuarioId, nombreCliente } = datos;
    const url = archivo
      ? await subirComprobante(archivo, pantalla.pedido.id, usuarioId, nombreCliente)
      : 'TIENDA_FISICA';

    return pagoApi.registrarPagoFinal(pantalla.pedido.id, {
      tipo_pago: 'SALDO_FINAL',
      monto: pantalla.montoPendiente,
      comprobante_url: url,
      notas_admin: nota.trim() || null,
    });
  },
};