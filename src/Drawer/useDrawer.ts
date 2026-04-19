import { useContext } from 'react';
import { BetterAntdContext } from '../Provider/context';
import type { DrawerAPI } from '../types';

export function useDrawer(): DrawerAPI {
  const ctx = useContext(BetterAntdContext);
  if (!ctx) {
    throw new Error('useDrawer must be used within <BetterAntdProvider>');
  }
  return { openDrawer: ctx.openDrawer, hideDrawer: ctx.hideDrawer };
}
