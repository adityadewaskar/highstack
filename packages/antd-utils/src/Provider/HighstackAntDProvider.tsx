'use client';
import React, {
  type ReactNode,
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Modal, Drawer, Spin } from 'antd';
import { HighstackAntDContext } from './context';
import type {
  ModalOptions,
  ModalStackItem,
  DrawerOptions,
  DrawerStackItem,
  HighstackAntDContextValue,
} from '../types';

const BASE_Z_INDEX = 1000;

interface HighstackAntDProviderProps {
  children: ReactNode;
  /** Base z-index for all modals/drawers. Each new one stacks +1 above. Default: 1000 */
  zIndex?: number;
}

export function HighstackAntDProvider({ children, zIndex: baseZIndex = BASE_Z_INDEX }: HighstackAntDProviderProps) {
  const [modalStack, setModalStack] = useState<ModalStackItem[]>([]);
  const [drawerStack, setDrawerStack] = useState<DrawerStackItem[]>([]);
  const zIndexCounter = useRef(baseZIndex);
  const nextZIndex = () => ++zIndexCounter.current;

  // --- Modal ---

  const openModal = useCallback((content: ReactNode, opts: ModalOptions = {}) => {
    setModalStack((prev) => [...prev, { content, opts, zIndex: nextZIndex() }]);
  }, []);

  const hideModal = useCallback(() => {
    setModalStack((prev) => prev.slice(0, -1));
  }, []);

  // --- Drawer ---

  const openDrawer = useCallback((content: ReactNode, opts: DrawerOptions = {}) => {
    setDrawerStack((prev) => [...prev, { content, opts, zIndex: nextZIndex() }]);
  }, []);

  const hideDrawer = useCallback(() => {
    setDrawerStack((prev) => prev.slice(0, -1));
  }, []);

  // --- Render helpers ---

  const renderContent = useCallback(
    (content: ReactNode, lazy: boolean | undefined, close: () => void, open: (c: ReactNode, o?: any) => void) => {
      if (!React.isValidElement(content)) return content;

      const enhanced = React.cloneElement(content as React.ReactElement<any>, {
        closeModal: close,
        closeDrawer: close,
        openModal,
        openDrawer,
      });

      return lazy ? <Suspense fallback={<Spin size="large" />}>{enhanced}</Suspense> : enhanced;
    },
    [openModal, openDrawer],
  );

  // --- Context ---

  const value: HighstackAntDContextValue = useMemo(
    () => ({ openModal, hideModal, openDrawer, hideDrawer }),
    [openModal, hideModal, openDrawer, hideDrawer],
  );

  return (
    <HighstackAntDContext.Provider value={value}>
      {children}

      {/* Modals */}
      {modalStack.map((item, index) => {
        const { content, opts, zIndex } = item;
        const { onClose, lazy, fullScreen, keyboardClosable, footer, closable, ...restOpts } = opts;

        return (
          <Modal
            key={index}
            open
            zIndex={zIndex}
            onCancel={onClose || hideModal}
            keyboard={keyboardClosable ?? true}
            maskClosable={closable ?? true}
            styles={fullScreen ? { body: { height: '80vh' } } : undefined}
            footer={footer ? footer(hideModal) : null}
            {...restOpts}
          >
            {renderContent(content, lazy, hideModal, openModal)}
          </Modal>
        );
      })}

      {/* Drawers */}
      {drawerStack.map((item, index) => {
        const { content, opts, zIndex } = item;
        const { onClose, lazy, keyboardClosable, footer, closable, bodyStyle, ...restOpts } = opts;

        return (
          <Drawer
            key={index}
            open
            zIndex={zIndex}
            onClose={onClose || hideDrawer}
            keyboard={keyboardClosable ?? true}
            maskClosable={closable ?? true}
            styles={{ body: bodyStyle || {} }}
            footer={footer ? footer(hideDrawer) : null}
            {...restOpts}
          >
            {renderContent(content, lazy, hideDrawer, openDrawer)}
          </Drawer>
        );
      })}
    </HighstackAntDContext.Provider>
  );
}
