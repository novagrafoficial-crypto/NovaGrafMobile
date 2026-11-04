import type { PantallaPago } from '../models/Pago';
import { folioDe, modoDePago, money } from './pagoUtils';
import { brandColors, brandTints } from '@/constants/brand';

// Evita que un nombre con "<" o "&" rompa el HTML
const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const nombreArchivoPdf = (pedidoId: number) => `Ficha-de-pago-${folioDe(pedidoId)}.pdf`;

export const htmlFichaPago = ({ pedido, metodo }: PantallaPago, cliente: string): string => {
  const modo = modoDePago(metodo);
  const folio = folioDe(pedido.id);
  const fecha = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const titulo =
    modo === 'TIENDA'
      ? 'Ticket de pago en tienda'
      : modo === 'DEPOSITO'
        ? 'Ficha de depósito bancario'
        : 'Datos para transferencia';

  const pasos =
    modo === 'TIENDA'
      ? 'Presenta este documento (impreso o en tu celular) en la tienda y paga tu anticipo.'
      : modo === 'DEPOSITO'
        ? 'Realiza el depósito con estos datos, conserva tu ficha y súbela en la app como comprobante.'
        : 'Realiza la transferencia con estos datos y sube tu comprobante en la app.';

  const filasDatos = (metodo?.datos ?? [])
    .map((d) => `<tr><td class="et">${esc(d.etiqueta)}</td><td class="val">${esc(d.valor)}</td></tr>`)
    .join('');

  const filaReferencia =
    modo !== 'TIENDA'
      ? `<tr><td class="et">Referencia / concepto</td><td class="val">${esc(folio)}</td></tr>`
      : '';

  const bloqueDatos =
    filasDatos || filaReferencia
      ? `<h2>${modo === 'TIENDA' ? 'Datos de la tienda' : 'Datos para tu pago'}</h2>
         <table class="datos">${filasDatos}${filaReferencia}</table>`
      : '';

  const instrucciones =
    metodo?.instrucciones && modo !== 'TIENDA'
      ? `<p class="instr">${esc(metodo.instrucciones)}</p>`
      : '';

  const productos = pedido.detalles
    .map(
      (d) => `<tr>
        <td>${esc(d.producto_nombre)}${d.color ? ` (${esc(d.color)})` : ''}</td>
        <td class="c">${d.cantidad}</td>
        <td class="r">${money(d.precio_unitario)}</td>
        <td class="r">${money(d.subtotal)}</td>
      </tr>`,
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
    body { font-family: Helvetica, Arial, sans-serif; color: ${brandColors.primaryDark}; font-size: 13px; }
    .top { background: ${brandColors.primaryDark}; color: #fff; padding: 18px 20px; border-radius: 10px; }
    .top .marca { font-size: 22px; font-weight: 800; letter-spacing: 1px; }
    .top .sub { font-size: 12px; opacity: .85; margin-top: 2px; }
    .folio { text-align: center; margin: 22px 0 4px; }
    .folio .n { font-size: 34px; font-weight: 800; letter-spacing: 2px; color: ${brandColors.primary}; }
    .folio .t { font-size: 13px; color: ${brandTints.textMuted}; }
    .meta { text-align: center; color: ${brandTints.textMuted}; line-height: 1.6; margin-bottom: 8px; }
    h2 { font-size: 14px; color: ${brandColors.primary}; margin: 22px 0 8px; border-bottom: 2px solid ${brandColors.accent}; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; }
    .datos td { padding: 8px 10px; border-bottom: 1px solid ${brandTints.border}; }
    .datos .et { width: 38%; font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${brandTints.textMuted}; }
    .datos .val { font-size: 15px; font-weight: 700; }
    .prod th { text-align: left; font-size: 11px; text-transform: uppercase; color: ${brandTints.textMuted}; padding: 6px 8px; border-bottom: 2px solid ${brandTints.border}; }
    .prod td { padding: 8px; border-bottom: 1px solid ${brandTints.border}; }
    .c { text-align: center; } .r { text-align: right; }
    th.c { text-align: center; } th.r { text-align: right; }
    .totales { margin-top: 10px; width: 55%; margin-left: auto; }
    .totales td { padding: 5px 8px; }
    .totales .r { font-weight: 700; }
    .pagar { background: ${brandTints.accentSoft}; border: 2px solid ${brandColors.accent}; border-radius: 12px; text-align: center; padding: 14px; margin-top: 18px; }
    .pagar .l { font-size: 12px; font-weight: 700; color: ${brandColors.primary}; }
    .pagar .m { font-size: 30px; font-weight: 800; color: ${brandColors.primary}; }
    .instr { background: ${brandTints.surfaceMuted}; padding: 10px 12px; border-radius: 8px; margin-top: 10px; }
    .pie { margin-top: 22px; text-align: center; font-size: 12px; color: ${brandTints.textMuted}; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="top">
    <div class="marca">NOVA GRAF</div>
    <div class="sub">${esc(titulo)}</div>
  </div>

  <div class="folio">
    <div class="t">Pedido</div>
    <div class="n">${esc(folio)}</div>
  </div>
  <div class="meta">
    Cliente: <b>${esc(cliente)}</b><br />
    Entrega: ${esc(pedido.metodo_entrega_nombre)}<br />
    Método de pago: ${esc(metodo?.nombre ?? '—')}<br />
    Generado el ${esc(fecha)}
  </div>

  <div class="pagar">
    <div class="l">${modo === 'TIENDA' ? 'MONTO A PAGAR EN TIENDA (ANTICIPO 50%)' : 'MONTO EXACTO A PAGAR (ANTICIPO 50%)'}</div>
    <div class="m">${money(pedido.monto_anticipo)} MXN</div>
  </div>

  ${bloqueDatos}
  ${instrucciones}

  <h2>Detalle del pedido</h2>
  <table class="prod">
    <thead><tr><th>Producto</th><th class="c">Cant.</th><th class="r">Precio</th><th class="r">Subtotal</th></tr></thead>
    <tbody>${productos}</tbody>
  </table>
  <table class="totales">
    <tr><td>Costo de envío</td><td class="r">${money(pedido.costo_envio)}</td></tr>
    <tr><td>Total</td><td class="r">${money(pedido.total_general)}</td></tr>
    <tr><td>Anticipo (50%)</td><td class="r">${money(pedido.monto_anticipo)}</td></tr>
    <tr><td>Saldo restante</td><td class="r">${money(pedido.monto_restante)}</td></tr>
  </table>

  <div class="pie">${esc(pasos)}<br />Conserva este documento como referencia de tu pedido.</div>
</body>
</html>`;
};