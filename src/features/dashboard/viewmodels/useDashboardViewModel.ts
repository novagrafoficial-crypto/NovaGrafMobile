import { brandColors } from '@/constants/brand';

// Datos de ejemplo. Cuando exista el endpoint, se reemplazan aquí y la vista no cambia.
export const useDashboardViewModel = () => {
  const estadisticas = [
    { titulo: 'Pedidos hoy', valor: '12', icono: '📋' },
    { titulo: 'Pedidos pendientes', valor: '5', icono: '⏳' },
    { titulo: 'Clientes activos', valor: '48', icono: '👥' },
    { titulo: 'Ventas del mes', valor: '$24,500', icono: '💰' },
  ];

  const accesosRapidos = [
    { titulo: 'Gestionar pedidos', icono: '📋', color: brandColors.primary },
    { titulo: 'Ver usuarios', icono: '👥', color: brandColors.accent },
    { titulo: 'Catálogo', icono: '📦', color: brandColors.primary },
    { titulo: 'Reportes', icono: '📊', color: brandColors.accent },
  ];

  return { estadisticas, accesosRapidos };
};
