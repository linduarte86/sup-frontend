'use client';

import React, { useEffect, useState } from 'react';
import styles from './style.module.scss';
import { BtCadastrar } from '@/app/components/button/btCadastrar';
import ContatosTable from '@/app/components/contatos/ContatosTable';
import { hasPermission } from '@/lib/hasPermission';
import { api } from '@/services/apiClient';

export default function Contatos() {
  const [canCreate, setCanCreate] = useState<boolean | null>(null);
  
    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          const res = await api.get('/me');
          if (!mounted) return;
          const nivel = res?.data?.nivel ?? null;
          const perms = res?.data?.permissions ?? res?.data?.permittedMenus ?? [];
          if (nivel === 'ADMIN' || (Array.isArray(perms) && perms.includes('CONTATOS_CREATE'))) {
            setCanCreate(true);
          } else {
            setCanCreate(false);
          }
        } catch (err) {
          // fallback: usa hasPermission se /me falhar
          setCanCreate(Boolean(hasPermission('CONTATOS_CREATE')));
        }
      })();
      return () => { mounted = false; };
    }, []);
  return (

    <main className={styles.container}>

       {(canCreate ?? hasPermission('CONTATOS_CREATE')) && (
        <div className={styles.btCadastrar}>
          <BtCadastrar name='Cadastrar' endpoint='contatos' />
        </div>
      )}

      <div className={styles.divTable}>
        <ContatosTable/>
      </div>

    </main>
  )
}