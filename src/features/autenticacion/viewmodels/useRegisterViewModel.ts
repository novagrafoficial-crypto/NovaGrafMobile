import { useState } from 'react';
import { useRouter } from 'expo-router';
import type { RegistroForm } from '../models/Registro';
import { authService } from '../services/authService';
import { formatFecha, validar } from '../utils/validaciones';

const EMPTY: RegistroForm = {
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

const STEP1: (keyof RegistroForm)[] = ['name', 'lastNameP', 'lastNameM', 'username', 'birthDate'];
const STEP2: (keyof RegistroForm)[] = ['address', 'phone', 'email', 'password', 'confirmPassword'];

type Errors = Partial<Record<keyof RegistroForm, string>>;

export const useRegisterViewModel = () => {
  const router = useRouter();
  const [form, setForm] = useState<RegistroForm>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (field: keyof RegistroForm, value: string) => {
    const clean = field === 'birthDate' ? formatFecha(value) : value;
    setForm((prev) => ({ ...prev, [field]: clean }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Valida un grupo de campos y guarda los errores. Devuelve true si todo está bien.
  const validateFields = (fields: (keyof RegistroForm)[]): boolean => {
    const next: Errors = {};
    let ok = true;
    fields.forEach((f) => {
      const msg = validar(f, form[f], form);
      next[f] = msg;
      if (msg) ok = false;
    });
    setErrors((prev) => ({ ...prev, ...next }));
    return ok;
  };

  const handleNext = () => {
    if (validateFields(STEP1)) {
      setError(null);
      setStep(2);
    } else {
      setError('Corrige los errores antes de continuar.');
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!validateFields(STEP2)) {
      setError('Corrige los errores antes de registrarte.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const payload: RegistroForm = {
        ...form,
        name: form.name.trim(),
        lastNameP: form.lastNameP.trim(),
        lastNameM: form.lastNameM.trim(),
        username: form.username.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
      };
      const res = await authService.register(payload);
      router.replace({
        pathname: '/(auth)/verify-account',
        params: { id_usuario: String(res.id_usuario) },
      } as any);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo completar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    errors,
    step,
    isLoading,
    error,
    setField,
    handleNext,
    handleBack,
    handleSubmit,
  };
};