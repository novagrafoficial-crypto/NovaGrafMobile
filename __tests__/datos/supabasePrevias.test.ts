/**
 * Subida de previas a Supabase Storage (XMLHttpRequest simulado).
 */
type Xhr = { status: number; responseText: string; onload?: () => void; onerror?: () => void; open: jest.Mock; setRequestHeader: jest.Mock; send: jest.Mock };

const instalarXhr = (comportamiento: (x: Xhr) => void) => {
  const xhr: Xhr = { status: 0, responseText: '', open: jest.fn(), setRequestHeader: jest.fn(), send: jest.fn(() => comportamiento(xhr)) };
  (globalThis as any).XMLHttpRequest = jest.fn(() => xhr);
  return xhr;
};

const cargar = (url?: string, key?: string) => {
  process.env.EXPO_PUBLIC_SUPABASE_URL = url;
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = key;
  if (!url) delete process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!key) delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  let mod: typeof import('../../src/data/supabasePrevias');
  jest.isolateModules(() => { mod = require('../../src/data/supabasePrevias'); });
  return mod!;
};

const archivo = { uri: 'file://p.png', mimeType: 'image/png' };

describe('Subida de previas a Supabase', () => {
  it('PSP-01 · sube la imagen al bucket Previas y regresa su URL pública', async () => {
    const xhr = instalarXhr((x) => { x.status = 200; x.onload?.(); });
    const { subirImagenPrevia } = cargar('https://sb.co', 'clave');
    await expect(subirImagenPrevia('previas/1.png', archivo)).resolves.toBe('https://sb.co/storage/v1/object/public/Previas/previas/1.png');
    expect(xhr.open).toHaveBeenCalledWith('POST', 'https://sb.co/storage/v1/object/Previas/previas/1.png');
    expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
  });

  it('PSP-02 · avisa si Supabase responde con error', async () => {
    instalarXhr((x) => { x.status = 403; x.responseText = 'denegado'; x.onload?.(); });
    const { subirImagenPrevia } = cargar('https://sb.co', 'clave');
    await expect(subirImagenPrevia('previas/1.png', archivo)).rejects.toThrow('Supabase 403');
  });

  it('PSP-03 · avisa si no hay red', async () => {
    instalarXhr((x) => x.onerror?.());
    const { subirImagenPrevia } = cargar('https://sb.co', 'clave');
    await expect(subirImagenPrevia('previas/1.png', archivo)).rejects.toThrow('Error de red');
  });

  it('PSP-04 · avisa si faltan las variables de entorno', async () => {
    const { subirImagenPrevia } = cargar(undefined, undefined);
    await expect(subirImagenPrevia('previas/1.png', archivo)).rejects.toThrow('Faltan EXPO_PUBLIC_SUPABASE_URL');
  });
});
