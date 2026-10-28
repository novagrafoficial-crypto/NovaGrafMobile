import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { useNotificaciones } from '@/features/notificaciones';
import type { ClientProfile } from '../models/ClientProfile';
import { clientProfileService } from '../services/clientProfileService';

type Mensaje = { text: string; ok: boolean };

export const useClientProfileViewModel = () => {
  const { user, deleteSession } = useAuth();
  const router = useRouter();
  const userId = user?.id_usuario;

  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [form, setForm] = useState<Partial<ClientProfile>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);

  const [toastMsg, setToastMsg] = useState<Mensaje | null>(null);

  const [showPwForm, setShowPwForm] = useState<boolean>(false);
  const [pwForm, setPwForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [pwSaving, setPwSaving] = useState<boolean>(false);
  const [pwMsg, setPwMsg] = useState<Mensaje | null>(null);

  const [logoutVisible, setLogoutVisible] = useState<boolean>(false);
  // Mostrar / ocultar lo que se escribe en los campos de contraseña
  const [verPw, setVerPw] = useState<boolean>(false);
  const { noLeidas } = useNotificaciones();

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const notify = (text: string, ok = true) => {
    setToastMsg({ text, ok });
    later(() => setToastMsg(null), 3500);
  };

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await clientProfileService.getProfile(userId);
      setProfile(data);
      setForm(data);
    } catch {
      notify('No se pudo cargar tu perfil', false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const res = await clientProfileService.updateProfile(userId, form);
      setProfile(res.user);
      setForm(res.user);
      setEditing(false);
      notify('Perfil actualizado correctamente', true);
    } catch (err: any) {
      notify(err.response?.data?.message || 'Error de conexión', false);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!userId) return;
    if (pwForm.nueva !== pwForm.confirmar) {
      setPwMsg({ text: 'Las contraseñas no coinciden', ok: false });
      return;
    }
    if (pwForm.nueva.length < 6) {
      setPwMsg({ text: 'Mínimo 6 caracteres', ok: false });
      return;
    }
    setPwSaving(true);
    try {
      const res = await clientProfileService.changePassword(userId, {
        actual: pwForm.actual,
        nueva: pwForm.nueva,
      });
      setPwMsg({ text: res.message, ok: true });
      setPwForm({ actual: '', nueva: '', confirmar: '' });
      later(() => {
        setShowPwForm(false);
        setPwMsg(null);
      }, 2000);
    } catch (err: any) {
      setPwMsg({ text: err.response?.data?.message || 'Error de conexión', ok: false });
    } finally {
      setPwSaving(false);
    }
  };

  // Cancelar la edición regresa los datos a como estaban
  const cancelarEdicion = () => {
    if (profile) setForm(profile);
    setEditing(false);
  };

  const confirmarLogout = async () => {
    setLogoutVisible(false);
    await deleteSession();
    router.replace('/' as any);
  };

  return {
    profile,
    form,
    setForm,
    loading,
    saving,
    editing,
    setEditing,
    toastMsg,
    showPwForm,
    alternarPwForm: () => {
      setShowPwForm((v) => !v);
      setPwMsg(null);
    },
    verPw,
    alternarVerPw: () => setVerPw((v) => !v),
    cancelarEdicion,
    noLeidas,
    irANotificaciones: () => router.push('/(cliente)/notificaciones' as any),
    irAPedidos: () => router.push('/(cliente)/pedidos' as any),
    pwForm,
    setPwForm,
    pwSaving,
    pwMsg,
    esGoogle: profile?.proveedor === 'google',
    logoutVisible,
    pedirLogout: () => setLogoutVisible(true),
    cancelarLogout: () => setLogoutVisible(false),
    confirmarLogout,
    handleSaveProfile,
    handleSavePassword,
  };
};