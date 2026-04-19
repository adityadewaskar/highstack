import { createContext } from 'react';
import type { BetterAntdContextValue } from '../types';

export const BetterAntdContext = createContext<BetterAntdContextValue | null>(null);
