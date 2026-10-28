import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { clientesAdminService } from '../services/clientesAdminService';
import type { Cliente } from '../models/Cliente';

export interface AvisoUI {
  texto: string;
  ok: boolean;
}

// Minúsculas y sin acentos para que "jose" encuentre "José".
const normalizar = (t: string) =>
  t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const nombreCompleto = (c: Cliente) =>
  [c.nombre, c.apellido_paterno, c.apellido_materno].filter(Boolean).join(' ');

const mensajeError = (e: any) =>
  e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? 'Ocurrió un error.';

export const useClientesAdminViewModel = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  // Filtro rápido por estado de la cuenta
  const [filtro, setFiltro] = useState<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS');
  // Se guarda el id (no una copia) para que el detalle siempre muestre el estado actual.
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);

  const [procesando, setProcesando] = useState<number[]>([]);
  const [aviso, setAviso] = useState<AvisoUI | null>(null);
  const [porDesactivar, setPorDesactivar] = useState<Cliente | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const mostrarAviso = (texto: string, ok = true) => {
    setAviso({ texto, ok });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 3500);
  };

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setClientes(await clientesAdminService.getClientes());
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'No se pudo cargar la lista de clientes.');
    } finally {
      setCargando(false);
    }
  }, []);

  // Se recarga cada vez que el admin vuelve a esta pestaña.
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const refrescar = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  const clientesFiltrados = useMemo(() => {
    const q = normalizar(busqueda);
    return clientes.filter((c) => {
      const coincideFiltro = filtro === 'TODOS' || (filtro === 'ACTIVOS' ? c.activo : !c.activo);
      const coincideTexto = !q || normalizar(`${nombreCompleto(c)} ${c.correo_electronico} ${c.nombre_usuario}`).includes(q);
      return coincideFiltro && coincideTexto;
    });
  }, [clientes, busqueda, filtro]);

  const activos = useMemo(() => clientes.filter((c) => c.activo).length, [clientes]);

  const seleccionado = useMemo(
    () => clientes.find((c) => c.id_usuario === seleccionadoId) ?? null,
    [clientes, seleccionadoId]
  );

  // ---- Activar / desactivar ----
  const aplicarActivo = async (c: Cliente, activo: boolean) => {
    setProcesando((p) => [...p, c.id_usuario]);
    try {
      await clientesAdminService.cambiarActivo(c.id_usuario, activo);
      setClientes((lista) => lista.map((x) => (x.id_usuario === c.id_usuario ? { ...x, activo } : x)));
      mostrarAviso(activo ? 'Cliente activado correctamente.' : 'Cliente desactivado correctamente.');
    } catch (e: any) {
      mostrarAviso(mensajeError(e), false);
    } finally {
      setProcesando((p) => p.filter((id) => id !== c.id_usuario));
    }
  };

  // Activar es directo; desactivar pide confirmación.
  const alternarActivo = (c: Cliente) => {
    if (procesando.includes(c.id_usuario)) return;
    if (c.activo) setPorDesactivar(c);
    else aplicarActivo(c, true);
  };

  const confirmarDesactivar = () => {
    const c = porDesactivar;
    setPorDesactivar(null);
    if (c) aplicarActivo(c, false);
  };

  return {
    clientes,
    clientesFiltrados,
    cargando,
    refrescando,
    error,
    busqueda,
    setBusqueda,
    filtro,
    setFiltro,
    activos,
    inactivos: clientes.length - activos,
    refrescar,
    reintentar: cargar,
    seleccionado,
    abrirDetalle: (c: Cliente) => setSeleccionadoId(c.id_usuario),
    cerrarDetalle: () => setSeleccionadoId(null),

    aviso,
    procesando,
    alternarActivo,
    porDesactivar,
    confirmarDesactivar,
    cancelarDesactivar: () => setPorDesactivar(null),
  };
};
