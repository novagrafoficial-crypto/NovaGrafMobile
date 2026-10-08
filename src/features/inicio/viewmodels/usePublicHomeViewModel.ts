import { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';

export const usePublicHomeViewModel = () => {
  const { user, isLoading } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return {
    user,
    isLoading,
    isDrawerOpen,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
  };
};
