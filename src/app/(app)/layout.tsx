//import React from 'react';
import Sidebar from '@/app/components/sidebar';
import Header from '@/app/components/header';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'AP-SUP-WEB',
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const username = cookieStore.get('username')?.value ?? 'Usuário';

  return (
    <div className="appLayout">
      <Sidebar />
      <main className="appMain">
        <Header username={username} />
        {children}
      </main>
    </div>
  );
}
