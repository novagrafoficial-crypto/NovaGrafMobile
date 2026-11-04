import { folioDe, money } from '@/shared/utils/format';
import { brandColors } from '@/constants/brand';
import type { PantallaPagoFinal } from '../models/PagoFinal';

// Evita que un nombre con "<" o "&" rompa el HTML
const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const textoEstado = (estado: string | undefined) =>
  estado === 'APROBADO' ? 'Aprobado' : estado === 'RECHAZADO' ? 'Rechazado' : 'En verificación';

export const nombreReciboPdf = (pedidoId: number) => `Recibo-pago-final-${folioDe(pedidoId)}.pdf`;

/** Recibo en PDF del pago final (lo que el cliente pagó y su estado). */
export const htmlReciboPagoFinal = ({ pedido, metodo, pagoFinal }: PantallaPagoFinal, cliente: string): string => {
  const folio = folioDe(pedido.id);
  const enTienda = pagoFinal?.comprobante_url === 'TIENDA_FISICA';
  const montoFinal = pagoFinal?.monto ?? pedido.monto_restante;
  const fecha = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

  const productos = pedido.detalles
    .map(
      (d) => `<tr>
        <td>${esc(d.producto_nombre)}${d.color ? ` (${esc(d.color)})` : ''}</td>
        <td class="c">${d.cantidad}</td>
        <td class="r">${money(d.subtotal)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @page { margin: 28px; }
    * { box-sizing: border-box; }
    body { font-family: Helvetica, Arial, sans-serif; color: #111111; font-size: 13px; }
    .top { background: ${brandColors.primary}; color: #fff; padding: 18px 20px; border-radius: 10px; }
    .top .marca { font-size: 22px; font-weight: 800; letter-spacing: 1px; }
    .top .sub { font-size: 12px; opacity: .9; margin-top: 2px; }
    .folio { text-align: center; margin: 22px 0 4px; }
    .folio .t { font-size: 13px; color: #3F3F46; }
    .folio .n { font-size: 32px; font-weight: 800; letter-spacing: 2px; }
    .meta { text-align: center; color: #3F3F46; line-height: 1.7; }
    .monto { border: 2px solid #111111; border-radius: 12px; text-align: center; padding: 14px; margin-top: 18px; }
    .monto .l { font-size: 12px; font-weight: 700; color: #3F3F46; text-transform: uppercase; }
    .monto .m { font-size: 30px; font-weight: 800; }
    .monto .e { font-size: 13px; margin-top: 4px; }
    h2 { font-size: 14px; margin: 22px 0 8px; border-bottom: 2px solid #E4E4E7; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; }
    td, th { padding: 7px 8px; border-bottom: 1px solid #E4E4E7; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; color: #3F3F46; }
    .c { text-align: center; } .r { text-align: right; }
    .tot td { border: none; padding: 4px 8px; }
    .tot .r { font-weight: 700; }
    .pie { margin-top: 22px; text-align: center; font-size: 12px; color: #3F3F46; }
  </style>
</head>
<body>
  <div class="top">
    <div class="marca">NOVA GRAF</div>
    <div class="sub">Recibo de pago final</div>
  </div>

  <div class="folio"><div class="t">Pedido</div><div class="n">${esc(folio)}</div></div>
  <div class="meta">
    Cliente: <b>${esc(cliente)}</b><br />
    Método de pago: ${esc(enTienda ? 'Pago en tienda' : metodo?.nombre ?? '—')}<br />
    Generado el ${esc(fecha)}
  </div>

  <div class="monto">
    <div class="l">Pago final (saldo)</div>
    <div class="m">${money(montoFinal)} MXN</div>
    <div class="e">Estado: <b>${esc(textoEstado(pagoFinal?.estado_pago))}</b></div>
  </div>

  <h2>Detalle del pedido</h2>
  <table>
    <thead><tr><th>Producto</th><th class="c">Cant.</th><th class="r">Subtotal</th></tr></thead>
    <tbody>${productos}</tbody>
  </table>
  <table class="tot" style="width:55%; margin-left:auto; margin-top:8px">
    <tr><td>Total del pedido</td><td class="r">${money(pedido.total_general)}</td></tr>
    <tr><td>Anticipo (50%)</td><td class="r">${money(pedido.monto_anticipo)}</td></tr>
    <tr><td>Pago final</td><td class="r">${money(montoFinal)}</td></tr>
  </table>

  <div class="pie">Conserva este recibo como comprobante de tu pago.</div>
</body>
</html>`;
};