'use client';

import React, { useEffect, useState } from 'react';
import styles from './modal.module.scss';
import { toast } from 'sonner';
import { api } from '@/services/apiClient';

type UserData = {
  name: string;
  email: string;
  password: string;
  nivel: 'OPERADOR' | 'ADMIN';
  permittedMenus?: string[];
  permissions?: string[]; // adicionado para compatibilidade com backend
};

type Props = {
  onClose: () => void;
  onCreate: (data: UserData) => Promise<void> | void;
};

const ALL_PERMISSIONS = [
  { key: 'DASHBOARD_VIEW', description: 'Ver dashboard' },
  { key: 'MONITORAMENTO_VIEW', description: 'Ver monitoramento' },
  { key: 'CONFIG_VIEW', description: 'Ver configurações' },
  { key: 'SUPERVISAO_VIEW', description: 'Ver supervisão' },
  { key: 'SUPERVISAO_CREATE', description: 'Criar supervisão' },
  { key: 'SUPERVISAO_EDIT', description: 'Editar supervisão' },
  { key: 'SUPERVISAO_DELETE', description: 'Excluir supervisão' },
  { key: 'SUPERVISAO_EDIT_ZONAS', description: 'Editar zonas supervisão' },
  { key: 'USERS_VIEW', description: 'Ver usuários' },
  { key: 'USERS_CREATE', description: 'Criar usuários' },
  { key: 'USERS_EDIT', description: 'Editar usuários' },
  { key: 'USERS_DELETE', description: 'Excluir usuários' },
  { key: 'CONTATOS_VIEW', description: 'Ver contatos' },
  { key: 'CONTATOS_CREATE', description: 'Criar contatos' },
  { key: 'CONTATOS_EDIT', description: 'Editar contatos' },
  { key: 'CONTATOS_DELETE', description: 'Excluir contatos' },
  { key: 'TIMER_VIEW', description: 'Ver timer' },
  { key: 'BACKUP_VIEW', description: 'Ver backup' },
  { key: 'BACKUP_RESTORE', description: 'Restaurar backup' },
  { key: 'INFORMACAO_VIEW', description: 'Ver informações' },
  { key: 'LOGS_VIEW', description: 'Ver logs' },
  { key: 'LOGS_DELETE', description: 'Excluir logs' },
];

export default function UserModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nivel, setNivel] = useState<'OPERADOR' | 'ADMIN'>('OPERADOR');
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [currentUserNivel, setCurrentUserNivel] = useState<'OPERADOR' | 'ADMIN' | null>(null);

  useEffect(() => {
    // initialize selected map
    const init: Record<string, boolean> = {};
    ALL_PERMISSIONS.forEach(p => {
      init[p.key] = false;
    });
    setSelected(init);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/me');
        if (!mounted) return;
        const n = res?.data?.nivel ?? null;
        setCurrentUserNivel(n);
        if (n === 'OPERADOR') setNivel('OPERADOR');
      } catch (e) {
        setCurrentUserNivel(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function togglePermission(key: string) {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const effectiveNivel = currentUserNivel === 'OPERADOR' ? 'OPERADOR' : nivel;
      const permissions = effectiveNivel === 'OPERADOR'
        ? Object.keys(selected).filter(k => selected[k])
        : undefined;

      const payload: UserData = {
        name,
        email,
        password,
        nivel: effectiveNivel,
      };

      if (permissions) {
        payload.permissions = permissions;
        payload.permittedMenus = permissions; // alias para compatibilidade
      }

      await onCreate(payload);
      toast.success('Usuário criado com sucesso');
      onClose();
    } catch (err: any) {
      console.error(err);
      const message = err?.message || 'Erro ao criar usuário';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <h3>Novo usuário</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">×</button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Nome
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome completo"
              required
            />
          </label>

          <label>
            E-mail
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label>
            Senha
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          <label>
            Nível
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value as any)}
              disabled={currentUserNivel === 'OPERADOR'}
              title={currentUserNivel === 'OPERADOR' ? 'Operador não pode criar/definir admins' : ''}
            >
              <option value="OPERADOR">OPERADOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>

          {nivel === 'OPERADOR' && (
            <fieldset className={styles.permissions}>
              <legend>Permissões (marque as permitidas)</legend>
              <div className={styles.permissionsGrid}>
                {ALL_PERMISSIONS.map(p => (
                  <label key={p.key} className={styles.permissionItem}>
                    <input
                      type="checkbox"
                      checked={!!selected[p.key]}
                      onChange={() => togglePermission(p.key)}
                    />
                    <div className={styles.permissionText}>
                      
                      <small className={styles.permissionDesc}>{p.description}</small>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className={styles.actions}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
