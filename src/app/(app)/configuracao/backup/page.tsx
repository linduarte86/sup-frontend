'use client';

import React, { useEffect, useState } from 'react';

import Backup from '@/app/components/backup/Backup';
import BackupRestory from "@/app/components/backup/BackupRestory";
import style from "./style.module.scss"
import { hasPermission } from '@/lib/hasPermission';
import { api } from '@/services/apiClient';

export default function Page() {
  const [bkRestore, setCanCreate] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/me');
        if (!mounted) return;
        const nivel = res?.data?.nivel ?? null;
        const perms = res?.data?.permissions ?? res?.data?.permittedMenus ?? [];
        if (nivel === 'ADMIN' || (Array.isArray(perms) && perms.includes('BACKUP_RESTORE'))) {
          setCanCreate(true);
        } else {
          setCanCreate(false);
        }
      } catch (err) {
        // fallback: usa hasPermission se /me falhar
        setCanCreate(Boolean(hasPermission('BACKUP_RESTORE')));
      }
    })();
    return () => { mounted = false; };
  }, []);
  return (

    <main className={style.container}>

      <div className={style.titulo}>
        <h1>Gerar e Restaurar Backup</h1>
      </div>

       <div className={style.backup}>
          <Backup />
        </div>

      {(bkRestore ?? hasPermission('BACKUP_RESTORE')) && (
        <div className={style.backup}>
          <BackupRestory />
        </div>
      )}

    </main>
  )
}