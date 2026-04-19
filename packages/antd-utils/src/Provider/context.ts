import { createContext } from 'react';
import type { HighstackAntDContextValue } from '../types';

export const HighstackAntDContext = createContext<HighstackAntDContextValue | null>(null);
