export const getInitials = (nombre?: string, apellido?: string): string => {
  const partesNombre = (nombre ?? '').trim().split(/\s+/).filter(Boolean);
  if (partesNombre.length === 0) return '??';

  const primerApellido = (apellido ?? '').trim().split(/\s+/).filter(Boolean)[0];

  if (primerApellido) return (partesNombre[0][0] + primerApellido[0]).toUpperCase();
  if (partesNombre.length >= 2) return (partesNombre[0][0] + partesNombre[1][0]).toUpperCase();
  return partesNombre[0].slice(0, 2).toUpperCase();
};
