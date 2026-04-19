import type { ModalProps, DrawerProps } from 'antd';
import type { ReactNode } from 'react';

// --- Modal ---

export interface ModalOptions extends Omit<ModalProps, 'open' | 'onOk' | 'onCancel' | 'children' | 'footer'> {
  closable?: boolean;
  onClose?: () => void;
  lazy?: boolean;
  fullScreen?: boolean;
  keyboardClosable?: boolean;
  footer?: (close: () => void) => ReactNode;
}

export interface ModalStackItem {
  content: ReactNode;
  opts: ModalOptions;
  zIndex: number;
}

export interface ModalAPI {
  openModal: (content: ReactNode, opts?: ModalOptions) => void;
  hideModal: () => void;
}

// --- Drawer ---

export interface DrawerOptions extends Omit<DrawerProps, 'open' | 'onClose' | 'children' | 'footer'> {
  closable?: boolean;
  onClose?: () => void;
  lazy?: boolean;
  keyboardClosable?: boolean;
  bodyStyle?: React.CSSProperties;
  footer?: (close: () => void) => ReactNode;
}

export interface DrawerStackItem {
  content: ReactNode;
  opts: DrawerOptions;
  zIndex: number;
}

export interface DrawerAPI {
  openDrawer: (content: ReactNode, opts?: DrawerOptions) => void;
  hideDrawer: () => void;
}

// --- Context ---

export interface BetterAntdContextValue extends ModalAPI, DrawerAPI {}
