import { useCallback, useEffect, useState } from 'react';
import { portfolioService } from '../services/portfolioService';
import type { PortfolioItem } from '../models/PortfolioItem';

type Scope = 'client' | 'public';

export const usePortfolioViewModel = (scope: Scope = 'client') => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setItems(
        scope === 'public' ? await portfolioService.getPublic() : await portfolioService.getAll()
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo cargar el portafolio');
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, isLoading, error, reload: load };
};
