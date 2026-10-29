// Subida de previas a Supabase Storage por REST (igual que data/supabase.ts del cliente,
// pero con el bucket "Previas" que usa la web del administrador).
const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET = 'Previas'; // mismo bucket que AdminPedidoDetalle.jsx

export const subirImagenPrevia = (
  ruta: string,
  archivo: { uri: string; mimeType: string }
): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!URL || !KEY) {
      return reject(new Error('Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY en el .env'));
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${URL}/storage/v1/object/${BUCKET}/${ruta}`);
    xhr.setRequestHeader('Authorization', `Bearer ${KEY}`);
    xhr.setRequestHeader('apikey', KEY);
    xhr.setRequestHeader('Content-Type', archivo.mimeType);
    xhr.setRequestHeader('x-upsert', 'false');

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(`${URL}/storage/v1/object/public/${BUCKET}/${ruta}`);
      } else {
        reject(new Error(`Error al subir imagen (Supabase ${xhr.status}): ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error('Error de red al subir la imagen.'));

    // En React Native, { uri } manda el archivo tal cual desde el teléfono
    xhr.send({ uri: archivo.uri } as any);
  });