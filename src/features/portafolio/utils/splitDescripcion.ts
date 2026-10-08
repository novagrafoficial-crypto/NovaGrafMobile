// La descripción del portafolio es texto largo: la primera línea sirve de título.
export const splitDescripcion = (texto: string | null | undefined) => {
  const limpio = (texto ?? '').trim();
  if (!limpio) return { titulo: null as string | null, detalle: null as string | null };
  const [primera, ...resto] = limpio.split('\n');
  const detalle = resto.join('\n').trim();
  return { titulo: primera.trim(), detalle: detalle || null };
};
