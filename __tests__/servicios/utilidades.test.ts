/**
 * Utilidades compartidas: contacto, ofertas y formato.
 */
import { iconoContacto, iconoRed, capitalizar, formatUrl, contactoHref, mapsHref } from '../../src/features/contacto/utils/links';
import { fechaCorta, textoDescuento, mejorOferta } from '../../src/features/ofertas/utils/descuento';
import { formatFecha, folioDe, money } from '../../src/shared/utils/format';

describe('Utilidades de contacto', () => {
  it('PU-01 · íconos con valor por defecto', () => {
    expect(iconoContacto('Correo')).toBe('mail-outline');
    expect(iconoContacto('fax')).toBe('information-circle-outline');
    expect(iconoRed('Instagram')).toBe('logo-instagram');
    expect(iconoRed('otra')).toBe('globe-outline');
  });

  it('PU-02 · capitaliza, completa la URL y arma enlaces del teléfono', () => {
    expect(capitalizar('hola')).toBe('Hola');
    expect(capitalizar('')).toBe('');
    expect(formatUrl('')).toBe('');
    expect(formatUrl('novagraf.com')).toBe('https://novagraf.com');
    expect(formatUrl('http://x.com')).toBe('http://x.com');
    expect(contactoHref('email', 'a@c')).toBe('mailto:a@c');
    expect(contactoHref('Teléfono', '771 123 4567')).toBe('tel:7711234567');
    expect(contactoHref('WhatsApp', '+52 (771) 123')).toBe('https://wa.me/52771123');
    expect(contactoHref('horario', '9 a 6')).toBeNull();
  });

  it('PU-03 · enlace a Google Maps solo si hay dirección', () => {
    expect(mapsHref({ direccion: 'Morelos 43', ciudad: 'Huejutla', estado: '', pais: 'México' } as any)).toContain('Morelos%2043%2C%20Huejutla%2C%20M%C3%A9xico');
    expect(mapsHref({} as any)).toBeNull();
  });
});

describe('Utilidades de ofertas', () => {
  it('PU-04 · fecha corta, texto del descuento y mejor oferta', () => {
    expect(fechaCorta('2026-11-03T10:00:00Z')).toBe('3 de noviembre');
    expect(fechaCorta('2026-13-01')).toBe('');
    expect(fechaCorta(undefined)).toBe('');
    expect(textoDescuento('porcentaje', 10)).toBe('10% OFF');
    expect(textoDescuento('porcentaje', 7.5)).toBe('7.5% OFF');
    expect(textoDescuento('fijo', 20)).toBe('$20.00 OFF');
    expect(textoDescuento('otro', 1)).toBe('');
    expect(mejorOferta([])).toBeNull();
    const fijo = { tipo: 'fijo', valor: 50 } as any;
    const p10 = { tipo: 'porcentaje', valor: 10 } as any;
    const p20 = { tipo: 'porcentaje', valor: 20 } as any;
    expect(mejorOferta([fijo, p10, p20])).toBe(p20);
    expect(mejorOferta([fijo, { tipo: 'fijo', valor: 80 } as any])?.valor).toBe(80);
  });
});

describe('Formato', () => {
  it('PU-05 · fecha, folio y dinero', () => {
    expect(formatFecha(null)).toBe('—');
    expect(formatFecha('no-es-fecha')).toBe('—');
    expect(formatFecha('2026-11-03T12:00:00Z')).not.toBe('—');
    expect(folioDe(15)).toBe('NG-00015');
    expect(money(12.5)).toBe('$12.50');
  });
});
