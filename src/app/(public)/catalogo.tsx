import { Redirect } from 'expo-router';

// La parte pública ya no muestra productos sin personalizar: este enlace viejo lleva a los trabajos.
export default function RutaCatalogoPublico() {
  return <Redirect href={'/(public)/trabajos' as any} />;
}
