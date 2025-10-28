//import React from 'react';
import Sidebar from '@/app/components/sidebar';
import Header from '@/app/components/header';
import { cookies } from 'next/headers';
import ToasterProvider from '@/app/components/ToasterProvider';

import styles from './layout.module.scss';
import { Footer } from '../components/footer';

export const metadata = {
  title: 'APEL-SUP-WEB',
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const username = cookieStore.get('username')?.value ?? 'Usuário';

  return (
    <>
      <ToasterProvider />
      <div className={styles.appLayout}>
        <Sidebar />
        <main className={styles.appMain}>
          <Header username={username} />
          <div className={styles.contentWrapper}>
            {children}
          </div>
          <div className={styles.footerWrapper}>
            <Footer />
          </div>
        </main>
      </div>
    </>
  );
}
