/**
 * Certificate Pinning (anti-MitM): configuración del CertificatePinner (OkHttp)
 * con las huellas SHA-256 de las autoridades certificadoras del backend.
 */
import {
  initializeSslPinning,
  isSslPinningAvailable,
  addSslPinningErrorListener,
} from 'react-native-ssl-public-key-pinning';
import {
  asegurarPinning,
  obtenerDominioApi,
  reiniciarPinningParaPruebas,
  HUELLAS_API,
  PINNING_EXPIRA,
} from '../../src/data/api/certificatePinning';

const iniciar = initializeSslPinning as jest.Mock;
const disponible = isSslPinningAvailable as jest.Mock;
const escuchar = addSslPinningErrorListener as jest.Mock;
const API = 'https://nova-graf-zbdt.onrender.com/api';

describe('Certificate pinning', () => {
  let aviso: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    reiniciarPinningParaPruebas();
    disponible.mockReturnValue(true);
    iniciar.mockResolvedValue(undefined);
    aviso = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => aviso.mockRestore());

  it('PS-26 · obtiene el dominio del backend solo si la URL es HTTPS', () => {
    expect(obtenerDominioApi(API)).toBe('nova-graf-zbdt.onrender.com');
    expect(obtenerDominioApi('HTTPS://Api.Ejemplo.com:443/x')).toBe('api.ejemplo.com');
    expect(obtenerDominioApi('http://192.168.1.10:3000/api')).toBeNull();
    expect(obtenerDominioApi(undefined)).toBeNull();
  });

  it('PS-27 · fija el dominio del backend con las huellas SHA-256 y fecha de expiración', async () => {
    await expect(asegurarPinning(API)).resolves.toBe(true);
    expect(iniciar).toHaveBeenCalledWith({
      'nova-graf-zbdt.onrender.com': {
        includeSubdomains: false,
        publicKeyHashes: [...HUELLAS_API],
        expirationDate: PINNING_EXPIRA,
      },
    });
    expect(escuchar).toHaveBeenCalledTimes(1);
  });

  it('PS-28 · las huellas son SHA-256 en Base64 e incluyen la cadena real del servidor', () => {
    expect(HUELLAS_API.length).toBeGreaterThanOrEqual(2);
    HUELLAS_API.forEach((h) => expect(h).toMatch(/^[A-Za-z0-9+/]{43}=$/));
    expect(new Set(HUELLAS_API).size).toBe(HUELLAS_API.length);
    expect(HUELLAS_API).toContain('kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4='); // WE1
    expect(HUELLAS_API).toContain('mEflZT5enoR1FuXLgYYGqnVEoZvmf9c2bVBpiOjYQ0c='); // GTS Root R4
  });

  it('PS-29 · se inicializa una sola vez aunque haya muchas peticiones', async () => {
    await Promise.all([asegurarPinning(API), asegurarPinning(API), asegurarPinning(API)]);
    expect(iniciar).toHaveBeenCalledTimes(1);
  });

  it('PS-30 · con una API local por HTTP no fija nada', async () => {
    await expect(asegurarPinning('http://localhost:3000/api')).resolves.toBe(false);
    expect(iniciar).not.toHaveBeenCalled();
  });

  it('PS-31 · en Expo Go (sin módulo nativo) no truena y no fija nada', async () => {
    disponible.mockReturnValue(false);
    await expect(asegurarPinning(API)).resolves.toBe(false);
    expect(iniciar).not.toHaveBeenCalled();
  });

  it('PS-32 · si el módulo nativo falla, la app sigue y lo registra', async () => {
    iniciar.mockRejectedValue(new Error('nativo'));
    await expect(asegurarPinning(API)).resolves.toBe(false);
    expect(aviso).toHaveBeenCalled();
  });

  it('PS-33 · un certificado que no coincide (posible MitM) queda registrado', async () => {
    await asegurarPinning(API);
    const callback = escuchar.mock.calls[0][0];
    callback({ serverHostname: 'nova-graf-zbdt.onrender.com', message: 'Certificate pinning failure' });
    expect(aviso).toHaveBeenCalledWith('[Seguridad] Certificado no confiable para nova-graf-zbdt.onrender.com');
  });
});
