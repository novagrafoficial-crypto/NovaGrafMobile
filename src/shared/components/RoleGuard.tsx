import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { homeByRole } from '@/shared/utils/roleRoutes';
import { Loading } from './Loading';
import type { Rol } from '@/types';

interface RoleGuardProps {
  rol: Rol;
  children: React.ReactNode;
}

// Protege un grupo de rutas: sin sesión -> login; con otro rol -> su propio inicio.
export const RoleGuard = ({ rol, children }: RoleGuardProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading fullScreen />;
  if (!user) return <Redirect href={'/(auth)/login' as any} />;
  if (user.rol !== rol) return <Redirect href={homeByRole(user.rol) as any} />;

  return <>{children}</>;
};
