'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Monitor, Settings, FileText, ChevronDown, User, Phone, Clock, Database, Menu, X } from 'lucide-react';
import Image from 'next/image';
import styles from './style.module.scss';

const menus = [
  { href: '/dashboard', label: 'Dashboard', Icon: Home },
  { href: '/supervisao', label: 'Monitoramento', Icon: Monitor },
  {
    href: '/configuracao',
    label: 'Configuração',
    Icon: Settings,
    children: [
      { href: '/configuracao/supervisao', label: 'Supervisão', Icon: Monitor },
      { href: '/configuracao/usuario', label: 'Usuário', Icon: User },
      { href: '/configuracao/contatos', label: 'Contatos', Icon: Phone },
      { href: '/configuracao/timer', label: 'Timer', Icon: Clock },
      { href: '/configuracao/backup', label: 'Backup', Icon: Database },
    ],
  },
  { href: '/logs', label: 'Logs', Icon: FileText },
];

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  // controla menus abertos (por href)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    return {
      '/configuracao': pathname?.startsWith('/configuracao') ?? false,
    };
  });

  // estado para mobile (sidebar recolhida/aberta)
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // mantém o submenu de configuração aberto se a rota estiver dentro de /configuracao
    if (pathname?.startsWith('/configuracao')) {
      setOpenMenus((s) => ({ ...s, '/configuracao': true }));
    }
    // fecha sidebar mobile ao navegar para outra rota
    setMobileOpen(false);
  }, [pathname]);

  function toggleMenu(href: string) {
    setOpenMenus((s) => ({ ...s, [href]: !s[href] }));
  }

  function toggleMobile() {
    setMobileOpen((v) => !v);
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <>
      {/* botão toggle fixo visível em telas pequenas */}
      <button
        type="button"
        className={styles.mobileToggle}
        onClick={toggleMobile}
        aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* backdrop quando aberto no mobile */}
      {mobileOpen && <div className={styles.backdrop} onClick={closeMobile} />}

      <aside
        className={`${styles.sidebar} ${className ?? ''} ${mobileOpen ? styles.mobileOpen : ''}`}
        aria-label="Sidebar principal"
      >
        <div className={styles.brand}>
          <Image src="/logoApel3.svg" alt="Logo Apel" width={40} height={40} className={styles.logo} />
        </div>

        <nav className={styles.nav} aria-label="Navegação principal">
          <ul className={styles.list}>
            {menus.map((m) => {
              const isActive = pathname === m.href || (pathname?.startsWith(m.href + '/') ?? false);
              const Icon = m.Icon as React.ComponentType<any> | undefined;

              // item com submenu
              if (m.children && m.children.length > 0) {
                const isOpen = !!openMenus[m.href];

                return (
                  <li key={m.href} className={styles.item}>
                    <button
                      type="button"
                      className={`${styles.toggleButton} ${isActive ? styles.active : ''} ${isOpen ? styles.open : ''}`}
                      onClick={() => toggleMenu(m.href)}
                      aria-expanded={isOpen}
                      aria-controls={`${m.href}-submenu`}
                    >
                      {Icon ? <Icon className={styles.icon} size={18} aria-hidden="true" /> : null}
                      <span className={styles.label}>{m.label}</span>
                      <ChevronDown className={`${styles.chevron} ${isOpen ? styles.rotated : ''}`} size={16} aria-hidden="true" />
                    </button>

                    <ul
                      id={`${m.href}-submenu`}
                      className={`${styles.submenu} ${isOpen ? styles.open : ''}`}
                      role="menu"
                      aria-hidden={!isOpen}
                    >
                      {m.children.map((c) => {
                        const isChildActive = pathname === c.href || (pathname?.startsWith(c.href + '/') ?? false);
                        const ChildIcon = (c as any).Icon as React.ComponentType<any> | undefined;
                        return (
                          <li key={c.href} className={styles.submenuItem} role="none">
                            <Link
                              href={c.href}
                              className={`${styles.submenuLink} ${isChildActive ? styles.active : ''}`}
                              role="menuitem"
                              aria-current={isChildActive ? 'page' : undefined}
                              onClick={closeMobile}
                            >
                              {ChildIcon ? <ChildIcon className={styles.subIcon} size={16} aria-hidden="true" /> : null}
                              <span className={styles.label}>{c.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              }

              // item normal
              return (
                <li key={m.href} className={styles.item}>
                  <Link
                    href={m.href}
                    className={`${styles.link} ${isActive ? styles.active : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={closeMobile}
                  >
                    {Icon ? <Icon className={styles.icon} size={18} aria-hidden="true" /> : null}
                    <span className={styles.label}>{m.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
