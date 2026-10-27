import * as Print from 'expo-print';
import { Directory, File } from 'expo-file-system';

export type ResultadoDescarga =
  | { estado: 'guardado'; carpeta: string }
  | { estado: 'cancelado' };

export const pdfService = {
  // Genera el PDF, pide una carpeta y lo guarda ahí con un nombre legible.
  descargar: async (html: string, nombre: string): Promise<ResultadoDescarga> => {
    const { uri } = await Print.printToFileAsync({ html });
    const bytes = await new File(uri).bytes();

    // Selector de carpetas del sistema. Si el usuario lo cierra, se cancela.
    let carpeta: Directory;
    try {
      carpeta = await Directory.pickDirectoryAsync();
    } catch {
      return { estado: 'cancelado' };
    }

    const archivo = carpeta.createFile(nombre, 'application/pdf');
    archivo.write(bytes);
    return { estado: 'guardado', carpeta: carpeta.name };
  },

  // Plan B (solo si el guardado directo falla): diálogo de impresión → "Guardar como PDF"
  imprimir: (html: string): Promise<void> => Print.printAsync({ html }),
};