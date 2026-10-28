import React, { createContext, useContext, useMemo, useState } from 'react';

interface MenuPublicoValue {
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
}

const MenuContext = createContext<MenuPublicoValue | undefined>(undefined);

// Un solo menú lateral para toda la parte pública: cualquier encabezado lo puede abrir.
export const MenuPublicoProvider = ({ children }: { children: React.ReactNode }) => {
  const [abierto, setAbierto] = useState(false);
  const value = useMemo(
    () => ({ abierto, abrir: () => setAbierto(true), cerrar: () => setAbierto(false) }),
    [abierto]
  );
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenuPublico = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenuPublico debe usarse dentro de <MenuPublicoProvider>');
  return ctx;
};
