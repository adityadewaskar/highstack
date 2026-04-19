import { useContext } from 'react';
import { BetterAntdContext } from '../Provider/context';
import type { ModalAPI } from '../types';

export function useModal(): ModalAPI {
  const ctx = useContext(BetterAntdContext);
  if (!ctx) {
    throw new Error('useModal must be used within <BetterAntdProvider>');
  }
  return { openModal: ctx.openModal, hideModal: ctx.hideModal };
}
