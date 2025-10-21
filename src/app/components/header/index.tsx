'use client';

import React from 'react';
import styles from './style.module.scss';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  username?: string;
};

export default function Header({ username = 'Usuário' }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      // ignore
    }
    router.push('/login');
  }

  return (
    <header className={styles.header}>
      <div className={styles.titleArea}>AP-SUP-WEB_V1</div>

      <div className={styles.userArea}>
        <span className={styles.username}>{username}</span>
        <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Sair">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
