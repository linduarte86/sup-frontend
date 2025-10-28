'use client';

import React, { useState } from 'react';
import styles from './modal.module.scss';
import { toast } from 'sonner';

type ContactData = {
  id?: string | number;
  name: string;
  email?: string;
  telefone?: string;
  receberEmail?: boolean;
  receberWhats?: boolean;
};

type Props = {
  contact: ContactData;
  onClose: () => void;
  onSave: (data: ContactData) => Promise<void> | void;
};

export default function ContatosEditModal({ contact, onClose, onSave }: Props) {
  const [name, setName] = useState(contact.name ?? '');
  const [email, setEmail] = useState(contact.email ?? '');
  const [telefone, setTelefone] = useState(contact.telefone ?? '');
  const [receberEmail, setReceberEmail] = useState(!!contact.receberEmail);
  const [receberWhats, setReceberWhats] = useState(!!contact.receberWhats);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave({ id: contact.id, name, email, telefone, receberEmail, receberWhats });
      toast.success('Contato atualizado');
      onClose();
    } catch (err: any) {
      console.error('Erro ao atualizar contato', err);
      const message = err?.message || err?.response?.data?.message || 'Erro ao atualizar contato';
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) toast.error(backendErrors.join('\n'));
      else toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <h3>Editar contato</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">×</button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Nome
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label>
            E-mail
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label>
            Telefone
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </label>

          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={receberEmail} onChange={(e) => setReceberEmail(e.target.checked)} /> Receber E-mail
          </label>

          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={receberWhats} onChange={(e) => setReceberWhats(e.target.checked)} /> Receber WhatsApp
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
