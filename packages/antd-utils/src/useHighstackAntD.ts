import { useContext } from 'react';
import { HighstackAntDContext } from './Provider/context';
import type { HighstackAntDContextValue } from './types';

/**
 * Access modal and drawer APIs from anywhere inside `<HighstackAntDProvider>`.
 *
 * ```tsx
 * const { openModal, hideModal, openDrawer, hideDrawer } = useHighstackAntD();
 * ```
 */
export function useHighstackAntD(): HighstackAntDContextValue {
  const ctx = useContext(HighstackAntDContext);
  if (!ctx) {
    throw new Error('useHighstackAntD must be used within <HighstackAntDProvider>');
  }
  return ctx;
}
