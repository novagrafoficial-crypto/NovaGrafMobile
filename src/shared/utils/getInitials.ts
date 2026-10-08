export const getInitials = (nombre?: string): string => {
  if (!nombre) return '??';

  const partes = nombre.trim().split(' ').filter(Boolean);

  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  if (partes[0].length >= 2) {
    return partes[0].slice(0, 2).toUpperCase();
  }
  return partes[0].toUpperCase();
};
