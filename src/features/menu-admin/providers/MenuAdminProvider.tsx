import React, { createContext, useContext, useMemo, useState } from 'react';

interface MenuAdminValue {
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
}

const MenuAdminContext = createContext<MenuAdminValue | undefined>(undefined);

// Un solo menú lateral para todo el panel del administrador.
export const MenuAdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [abierto, setAbierto] = useState(false);
  const value = useMemo(
    () => ({ abierto, abrir: () => setAbierto(true), cerrar: () => setAbierto(false) }),
    [abierto]
  );
  return <MenuAdminContext.Provider value={value}>{children}</MenuAdminContext.Provider>;
};

export const useMenuAdmin = () => {
  const ctx = useContext(MenuAdminContext);
  if (!ctx) throw new Error('useMenuAdmin debe usarse dentro de <MenuAdminProvider>');
  return ctx;
};

/** Igual que useMenuAdmin, pero devuelve null si no hay menú (no truena). Lo usa el AdminHeader. */
export const useMenuAdminOpcional = () => useContext(MenuAdminContext) ?? null;
