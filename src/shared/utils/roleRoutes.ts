import type { Rol } from '@/types';

export const homeByRole = (rol: Rol): string => {
  switch (rol) {
    case 'administrador':
      return '/(admin)/dashboard';
    case 'cliente':
      return '/(cliente)/inicio';
    default:
      return '/';
  }
};
