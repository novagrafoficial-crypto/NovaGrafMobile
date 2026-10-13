const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// '2024-05-10T00:00:00.000Z' -> 'mayo de 2024'
// Se lee del texto (no con new Date) para que la zona horaria no cambie el mes.
export const formatMesAnio = (fecha?: string): string => {
  const m = /^(\d{4})-(\d{2})/.exec(fecha ?? '');
  if (!m) return '';
  const mes = MESES[Number(m[2]) - 1];
  return mes ? `${mes} de ${m[1]}` : '';
};