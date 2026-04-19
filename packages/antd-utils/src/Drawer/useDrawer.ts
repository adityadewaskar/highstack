import { useContext } from 'react';
import { HighstackAntDContext } from '../Provider/context';
import type { DrawerAPI } from '../types';

export function useDrawer(): DrawerAPI {
  const ctx = useContext(HighstackAntDContext);
  if (!ctx) {
    throw new Error('useDrawer must be used within <HighstackAntDProvider>');
  }
  return { openDrawer: ctx.openDrawer, hideDrawer: ctx.hideDrawer };
}
