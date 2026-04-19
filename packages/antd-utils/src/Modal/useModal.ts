import { useContext } from 'react';
import { HighstackAntDContext } from '../Provider/context';
import type { ModalAPI } from '../types';

export function useModal(): ModalAPI {
  const ctx = useContext(HighstackAntDContext);
  if (!ctx) {
    throw new Error('useModal must be used within <HighstackAntDProvider>');
  }
  return { openModal: ctx.openModal, hideModal: ctx.hideModal };
}
