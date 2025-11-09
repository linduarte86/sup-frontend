'use client';

import React from 'react';
import styles from './style.module.scss';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import { SomAlerta } from '../somAlerta';


type HeaderProps = {
  username?: string;
};

export default function Header({ username = 'Usuário' }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await deleteCookie('session', { path: '/' });
      await deleteCookie('username', { path: '/' });
    } catch (err) {
      // ignore
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
