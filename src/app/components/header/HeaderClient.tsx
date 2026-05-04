'use client';

import React from 'react';
import styles from './style.module.scss';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SomAlerta } from '../somAlerta';


type HeaderProps = {
  username?: string;
};

export default function HeaderClient({ username }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
       await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
       console.error('Erro ao fazer logout', err);
    }
    router.replace('/login');
    
  }

  return (
    <header className={styles.header}>
      <div className={styles.titleArea}>AP-SUP-WEB_v1</div>
      <div className={styles.btSom}><SomAlerta/></div>

      <div className={styles.userArea}>
        <span className={styles.username}>{username}</span>
        <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Sair">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
