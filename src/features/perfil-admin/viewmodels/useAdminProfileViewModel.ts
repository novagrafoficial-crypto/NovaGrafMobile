import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { adminProfileService } from '../services/adminProfileService';
import type { AdminProfile, AdminProfileForm } from '../models/AdminProfile';

export interface AvisoUI {
  texto: string;
  ok: boolean;
}

const aForm = (p: AdminProfile): AdminProfileForm => ({
  nombre: p.nombre,
  apellido_paterno: p.apellido_paterno,
  apellido_materno: p.apellido_materno,
  nombre_usuario: p.nombre_usuario,
  telefono: p.telefono,
});

const FORM_VACIO: AdminProfileForm = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  nombre_usuario: '',
  telefono: '',
};

export const useAdminProfileViewModel = () => {
  const { user, saveSession, deleteSession } = useAuth();
  const router = useRouter();
  const userId = user?.id_usuario;

  const [perfil, setPerfil] = useState<AdminProfile | null>(null);
  const [form, setForm] = useState<AdminProfileForm>(FORM_VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [aviso, setAviso] = useState<AvisoUI | null>(null);

  const [verPw, setVerPw] = useState(false);
  const [pw, setPw] = useState({ actual: '', nueva: '', confirmar: '' });
  const [pwGuardando, setPwGuardando] = useState(false);
  const [pwAviso, setPwAviso] = useState<AvisoUI | null>(null);

  const [logoutVisible, setLogoutVisible] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const mostrar = (texto: string, ok = true) => {
    setAviso({ texto, ok });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 3500);
  };

  const cargar = useCallback(async () => {
    if (!userId) return;
    try {
      setCargando(true);
      const data = await adminProfileService.getProfile(userId);
      setPerfil(data);
      setForm(aForm(data));
    } catch {
      mostrar('No se pudo cargar tu perfil.', false);
    } finally {
      setCargando(false);
    }
  }, [userId]);

  useEffect(() => { cargar(); }, [cargar]);

  const editarCampo = (campo: keyof AdminProfileForm, valor: string) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const cancelarEdicion = () => {
    if (perfil) setForm(aForm(perfil));
    setEditando(false);
  };

  const guardarPerfil = async () => {
    if (!userId) return;
    if (!form.nombre.trim() || !form.apellido_paterno.trim() || !form.nombre_usuario.trim()) {
      mostrar('Nombre, apellido paterno y usuario son obligatorios.', false);
      return;
    }
    setGuardando(true);
    try {
      const actualizado = await adminProfileService.updateProfile(userId, form);
      setPerfil(actualizado);
      setForm(aForm(actualizado));
      setEditando(false);
      // Mantiene el nombre de la sesión guardada al día.
      if (user) await saveSession({ ...user, nombre: actualizado.nombre });
      mostrar('Perfil actualizado correctamente.');
    } catch (e: any) {
      mostrar(e?.response?.data?.message ?? 'Error de conexión.', false);
    } finally {
      setGuardando(false);
    }
  };

  const guardarContrasena = async () => {
    if (!userId) return;
    if (!pw.actual || !pw.nueva) {
      setPwAviso({ texto: 'Completa todos los campos.', ok: false });
      return;
    }
    if (pw.nueva.length < 6) {
      setPwAviso({ texto: 'La contraseña debe tener al menos 6 caracteres.', ok: false });
      return;
    }
    if (pw.nueva !== pw.confirmar) {
      setPwAviso({ texto: 'Las contraseñas no coinciden.', ok: false });
      return;
    }
    setPwGuardando(true);
    try {
      const res = await adminProfileService.changePassword(userId, { actual: pw.actual, nueva: pw.nueva });
      setPw({ actual: '', nueva: '', confirmar: '' });
      setPwAviso({ texto: res.message ?? 'Contraseña actualizada.', ok: true });
    } catch (e: any) {
      setPwAviso({ texto: e?.response?.data?.message ?? 'Error de conexión.', ok: false });
    } finally {
      setPwGuardando(false);
    }
  };

  const alternarPw = () => {
    setVerPw((v) => !v);
    setPwAviso(null);
  };

  const confirmarLogout = async () => {
    setLogoutVisible(false);
    await deleteSession();
    router.replace('/' as any);
  };

  return {
    perfil, form, editarCampo, cargando, guardando, editando,
    iniciarEdicion: () => setEditando(true), cancelarEdicion, guardarPerfil,
    aviso,
    esGoogle: perfil?.proveedor === 'google',
    verPw, alternarPw, pw, setPw, pwGuardando, pwAviso, guardarContrasena,
    logoutVisible,
    pedirLogout: () => setLogoutVisible(true),
    cancelarLogout: () => setLogoutVisible(false),
    confirmarLogout,
  };
};
