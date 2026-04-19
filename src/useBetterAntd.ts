import { useContext } from 'react';
import { BetterAntdContext } from './Provider/context';
import type { BetterAntdContextValue } from './types';

/**
 * Access modal and drawer APIs from anywhere inside `<BetterAntdProvider>`.
 *
 * ```tsx
 * const { openModal, hideModal, openDrawer, hideDrawer } = useBetterAntd();
 * ```
 */
export function useBetterAntd(): BetterAntdContextValue {
  const ctx = useContext(BetterAntdContext);
  if (!ctx) {
    throw new Error('useBetterAntd must be used within <BetterAntdProvider>');
  }
  return ctx;
}
