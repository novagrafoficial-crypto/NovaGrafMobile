import { useState } from 'react';
import { useRouter } from 'expo-router';
import type { RegistroForm } from '../models/Registro';
import { authService } from '../services/authService';
import { fechaAISO, limpiarCampo, reglasPassword, validar } from '../utils/validaciones';

const VACIO: RegistroForm = {
  name: '',
  lastNameP: '',
  lastNameM: '',
  username: '',
  birthDate: '',
  address: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
};

// Paso 1: quién eres · Paso 2: cómo te contactamos y tu acceso
const PASO1: (keyof RegistroForm)[] = ['name', 'lastNameP', 'lastNameM', 'birthDate', 'phone', 'address'];
const PASO2: (keyof RegistroForm)[] = ['username', 'email', 'password', 'confirmPassword'];

type Errores = Partial<Record<keyof RegistroForm, string>>;

export const useRegisterViewModel = () => {
  const router = useRouter();
  const [form, setForm] = useState<RegistroForm>(VACIO);
  const [errores, setErrores] = useState<Errores>({});
  // Campos que ya tocó: solo a esos se les muestra el error mientras escribe
  const [tocados, setTocados] = useState<Partial<Record<keyof RegistroForm, boolean>>>({});
  const [paso, setPaso] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (campo: keyof RegistroForm, valor: string) => {
    const limpio = limpiarCampo(campo, valor);
    const nuevo = { ...form, [campo]: limpio };
    setForm(nuevo);
    // Si ya lo había tocado, se revisa al momento (y la confirmación cuando cambia la contraseña)
    setErrores((e) => ({
      ...e,
      ...(tocados[campo] ? { [campo]: validar(campo, limpio, nuevo) } : {}),
      ...(campo === 'password' && tocados.confirmPassword
        ? { confirmPassword: validar('confirmPassword', nuevo.confirmPassword, nuevo) }
        : {}),
    }));
  };

  // Al salir del campo se valida
  const tocar = (campo: keyof RegistroForm) => {
    setTocados((t) => ({ ...t, [campo]: true }));
    setErrores((e) => ({ ...e, [campo]: validar(campo, form[campo], form) }));
  };

  const validarGrupo = (campos: (keyof RegistroForm)[]): boolean => {
    const nuevos: Errores = {};
    campos.forEach((c) => (nuevos[c] = validar(c, form[c], form)));
    setErrores((e) => ({ ...e, ...nuevos }));
    setTocados((t) => ({ ...t, ...Object.fromEntries(campos.map((c) => [c, true])) }));
    return campos.every((c) => !nuevos[c]);
  };

  const siguiente = () => {
    if (validarGrupo(PASO1)) {
      setError(null);
      setPaso(2);
    } else {
      setError('Revisa los campos marcados en rojo.');
    }
  };

  const atras = () => {
    setError(null);
    setPaso(1);
  };

  const registrar = async () => {
    if (!validarGrupo(PASO2)) {
      setError('Revisa los campos marcados en rojo.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.register({
        ...form,
        name: form.name.trim(),
        lastNameP: form.lastNameP.trim(),
        lastNameM: form.lastNameM.trim(),
        username: form.username.trim(),
        birthDate: fechaAISO(form.birthDate), // el backend espera AAAA-MM-DD
        address: form.address.trim(),
        phone: form.phone,
        email: form.email.trim().toLowerCase(),
      });
      router.replace({
        pathname: '/(auth)/verify-account',
        params: { id_usuario: String(res.id_usuario) },
      } as any);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo completar el registro. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    errores,
    paso,
    isLoading,
    error,
    reglas: reglasPassword(form.password),
    setField,
    tocar,
    siguiente,
    atras,
    registrar,
    volver: () => (paso === 2 ? atras() : router.canGoBack() ? router.back() : router.replace('/' as any)),
    irALogin: () => router.replace('/(auth)/login' as any),
  };
};
