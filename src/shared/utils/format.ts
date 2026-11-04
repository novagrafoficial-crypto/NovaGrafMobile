export const folioDe = (id: number) => `NG-${String(id).padStart(5, '0')}`;
export const money = (n: number) => `$${n.toFixed(2)}`;

export const formatFecha = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};