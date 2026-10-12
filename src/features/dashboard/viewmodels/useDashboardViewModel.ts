import { brandColors } from '@/constants/brand';

// Datos de ejemplo. Cuando exista el endpoint, se reemplazan aquí y la vista no cambia.
export const useDashboardViewModel = () => {
  const estadisticas = [
    { titulo: 'Pedidos hoy', valor: '12', icono: '📋' },
    { titulo: 'Pedidos pendientes', valor: '5', icono: '⏳' },
    { titulo: 'Clientes activos', valor: '48', icono: '👥' },
    { titulo: 'Ventas del mes', valor: '$24,500', icono: '💰' },
  ];

  // `ruta` es opcional: los accesos sin pantalla todavía no navegan a ningún lado.
  const accesosRapidos: { titulo: string; icono: string; color: string; ruta?: string }[] = [
    { titulo: 'Gestionar pedidos', icono: '📋', color: brandColors.primary },
    { titulo: 'Ver usuarios', icono: '👥', color: brandColors.primaryDark, ruta: '/(admin)/usuarios' },
    { titulo: 'Catálogo', icono: '📦', color: brandColors.primaryDark, ruta: '/(admin)/productos' },
    { titulo: 'Reportes', icono: '📊', color: brandColors.primary },
  ];

  return { estadisticas, accesosRapidos };
};
