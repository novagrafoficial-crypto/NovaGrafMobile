import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { contactoService } from '../services/contactoService';
import { capitalizar, contactoHref, formatUrl, iconoContacto, iconoRed, mapsHref } from '../utils/links';
import type { AccionRapida, ContactoData, FilaContacto, RedVista } from '../models/Contacto';

const VACIO: ContactoData = { contactos: [], redes: [], ubicacion: null };

const esHorario = (tipo: string) => tipo.toLowerCase() === 'horario';

export const useContactoViewModel = () => {
  const router = useRouter();
  const [data, setData] = useState<ContactoData>(VACIO);
  const [loading, setLoading] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const cargar = useCallback(async (esRefresco = false) => {
    try {
      if (esRefresco) setRefrescando(true);
      else setLoading(true);
      setError(null);
      setData(await contactoService.getContacto());
    } catch {
      setError('No se pudo cargar la información. Revisa tu conexión.');
    } finally {
      setLoading(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // ── Datos derivados, listos para la vista ──
  const filas = useMemo<FilaContacto[]>(
    () =>
      data.contactos
        .filter((c) => !esHorario(c.tipo))
        .map((c) => ({
          id: c.id,
          tipo: c.tipo.toLowerCase(),
          icono: iconoContacto(c.tipo),
          etiqueta: capitalizar(c.tipo),
          valor: c.valor,
          href: contactoHref(c.tipo, c.valor),
        })),
    [data.contactos]
  );

  const horario = useMemo(
    () => data.contactos.find((c) => esHorario(c.tipo))?.valor ?? null,
    [data.contactos]
  );

  // Botones grandes de arriba: llamar, WhatsApp y correo (solo los que existan)
  const acciones = useMemo<AccionRapida[]>(() => {
    const buscar = (tipos: string[]) => filas.find((f) => tipos.includes(f.tipo) && f.href);
    const definidas = [
      { clave: 'llamar', icono: 'call', titulo: 'Llamar', fila: buscar(['telefono', 'teléfono']) },
      { clave: 'whatsapp', icono: 'logo-whatsapp', titulo: 'WhatsApp', fila: buscar(['whatsapp']) },
      { clave: 'correo', icono: 'mail', titulo: 'Correo', fila: buscar(['email', 'correo']) },
    ];
    return definidas.flatMap((a) =>
      a.fila?.href ? [{ clave: a.clave, icono: a.icono, titulo: a.titulo, href: a.fila.href }] : []
    );
  }, [filas]);

  const redes = useMemo<RedVista[]>(
    () =>
      data.redes
        .filter((r) => r.url)
        .map((r) => ({ id: r.id, nombre: r.nombre, icono: iconoRed(r.nombre), href: formatUrl(r.url) })),
    [data.redes]
  );

  const u = data.ubicacion;
  const ubicacionLineas = useMemo<string[]>(
    () =>
      u
        ? [u.direccion, u.ciudad, u.estado, u.codigo_postal ? `CP ${u.codigo_postal}` : '', u.pais].filter(Boolean)
        : [],
    [u]
  );
  const mapaHref = useMemo(() => (u ? mapsHref(u) : null), [u]);

  const sinInformacion = filas.length === 0 && redes.length === 0 && !horario && !u;

  const avisar = (texto: string) => {
    setAviso(texto);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 3000);
  };

  // Abre el enlace en la app del teléfono (llamadas, correo, WhatsApp, mapas, redes)
  const abrir = async (href: string | null) => {
    if (!href) return;
    try {
      await Linking.openURL(href);
    } catch {
      avisar('No se pudo abrir el enlace en este dispositivo.');
    }
  };

  return {
    loading,
    refrescando,
    error,
    aviso,
    acciones,
    filas,
    horario,
    redes,
    ubicacionLineas,
    mapaHref,
    sinInformacion,
    abrir,
    reintentar: () => cargar(),
    refrescar: () => cargar(true),
    regresar: () => (router.canGoBack() ? router.back() : router.replace('/' as any)),
  };
};