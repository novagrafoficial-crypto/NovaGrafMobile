import { Redirect } from 'expo-router';


export default function RutaCatalogoPublico() {
  return <Redirect href={'/(public)/trabajos' as any} />;
}
