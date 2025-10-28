'use client';

import React, { useState } from 'react';
import styles from './modal.module.scss';
import { api } from '@/services/api';
import { toast } from 'sonner';

type User = {
  id: string | number;
  name: string;
  email?: string;
  nivel?: string;
};

type Props = {
  user: User;
  onClose: () => void;
  onSaved: (user: User) => void;
};

export default function UserEditModal({ user, onClose, onSaved }: Props) {
  const [name, setName] = useState(user.name ?? '');
  const [email, setEmail] = useState(user.email ?? '');
  const [nivel, setNivel] = useState(user.nivel ?? 'OPERADOR');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // validações cliente
    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) {
        toast.error('Nova senha deve ter pelo menos 8 caracteres');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('Nova senha e confirmação não conferem');
        return;
      }
      if (!oldPassword) {
        toast.error('Informe a senha antiga para alterar a senha');
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = document.cookie.split('; ').find((r) => r.startsWith('session='))?.split('=')[1];
      const payload: any = {
        name: String(name ?? ''),
        email: String(email ?? ''),
        nivel: String(nivel ?? 'OPERADOR'),
        ...(oldPassword ? { oldPassword: String(oldPassword) } : {}),
        ...(newPassword ? { newPassword: String(newPassword) } : {}),
        ...(confirmPassword ? { confirmPassword: String(confirmPassword) } : {}),
      };

      const res = await api.put(`/users/${user.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      toast.success('Usuário atualizado');
      onSaved(res.data);
      onClose();
    } catch (err: any) {
      console.error('Erro ao atualizar usuário', err);
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        toast.error(backendErrors.join('\n'));
      } else {
        const message = err?.response?.data?.message || err?.message || 'Erro ao atualizar usuário';
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <h3>Editar usuário</h3>
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
            Nível
            <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
              <option value="OPERADOR">OPERADOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
          
          <label>
            Senha antiga
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          </label>

          <label>
            Nova senha
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </label>

          <label>
            Confirmar nova senha
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </label>

          <div className={styles.actions}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
