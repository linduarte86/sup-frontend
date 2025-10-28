'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './style.module.scss';
import UserModal from '@/app/components/users/UserModal';
import ContatosModal from '@/app/components/contatos/ContatosModal';
import SupModal from '@/app/components/supervisao/SupModal';
import { api } from '@/services/api';

interface ModalProps {
  onClose: () => void;
  onCreate: (data: any) => Promise<void> | void;
}

interface BtCadastrarProps {
  name?: string;
  value?: string; // legacy: endpoint string (ex: 'users' or '/users')
  endpoint?: string; // preferred: endpoint path
  eventName?: string; // event to dispatch on success
  Modal?: React.ComponentType<ModalProps>;
}

export function BtCadastrar({ name, value, endpoint, eventName, Modal }: BtCadastrarProps) {
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const openTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (openTimer.current) {
        clearTimeout(openTimer.current);
        openTimer.current = null;
      }
    };
  }, []);

  function handleOpenWithDelay(delay = 250) {
    if (opening || open) return;
    setOpening(true);
    openTimer.current = window.setTimeout(() => {
      setOpen(true);
      setOpening(false);
      openTimer.current = null;
    }, delay);
  }

  const ep = (endpoint ?? value ?? 'users');
  const endpointPath = ep.startsWith('/') ? ep : `/${ep}`;
  const evt = eventName ?? `${ep.replace(/^\//, '')}:created`;

  const modalsMap = {
    '/users': UserModal,
    '/equipamentos': SupModal,
    '/contatos': ContatosModal
  };

  // Procura a chave que esteja contida em endpointPath
  const foundKey = Object.keys(modalsMap).find(key =>
    endpointPath.includes(key)
  );

  const defaultModal = foundKey ? modalsMap[foundKey as keyof typeof modalsMap] : UserModal;


  // escolhe o modal padrão baseado no endpoint (permite override pela prop Modal)
  //const defaultModal = endpointPath.includes('/contato') ? ContatosModal : UserModal;
  const ModalComponent = Modal ?? defaultModal;
  const buttonName = name ?? 'Cadastrar';

  async function handleCreate(data: any) {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1];
      await api.post(endpointPath, data, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      // dispara evento para recarregar listas
      window.dispatchEvent(new CustomEvent(evt));
    } catch (error: any) {
      console.error('Erro ao criar (btCadastrar)', error);
      const backendErrors = error?.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        throw new Error(backendErrors.join('\n'));
      }
      throw error;
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.btCadastrar}
        onClick={() => handleOpenWithDelay(250)}
        disabled={opening}
      >
        {opening ? 'Abrindo...' : buttonName}
      </button>
      {open && <ModalComponent onClose={() => setOpen(false)} onCreate={handleCreate} />}
    </>
  );
}