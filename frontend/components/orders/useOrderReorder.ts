'use client';

import { useCart } from '@/components/cart/CartProvider';
import { ReorderError, executeOrderReorder } from '@/lib/reorder';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export function useOrderReorder() {
  const router = useRouter();
  const { loadCheckoutItems } = useCart();
  const [isReordering, setIsReordering] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);

  const reorder = useCallback(async (orderNumber: string) => {
    const token = window.localStorage.getItem('auth_token');

    if (!token) {
      router.push('/login');
      return;
    }

    setIsReordering(true);
    setReorderError(null);

    try {
      await executeOrderReorder(token, orderNumber, loadCheckoutItems, router);
    } catch (error) {
      setReorderError(error instanceof ReorderError ? error.message : 'Could not prepare reorder.');
    } finally {
      setIsReordering(false);
    }
  }, [loadCheckoutItems, router]);

  return { reorder, isReordering, reorderError, clearReorderError: () => setReorderError(null) };
}
