'use client';

import React, { useState } from 'react';
import styles from './modal.module.scss';
import { toast } from 'sonner';

type UserData = {
  name: string;
  email: string;
  password: string;
  nivel: 'OPERADOR' | 'ADMIN';
};

type Props = {
  onClose: () => void;
  onCreate: (data: UserData) => Promise<void> | void;
};

export default function UserModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nivel, setNivel] = useState<'OPERADOR' | 'ADMIN'>('OPERADOR');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreate({ name, email, password, nivel });
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
            <input value={name} onChange={(e) => setName(e.target.value)} required />
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
            <select value={nivel} onChange={(e) => setNivel(e.target.value as any)}>
              <option value="OPERADOR">OPERADOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>

          <div className={styles.actions}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
