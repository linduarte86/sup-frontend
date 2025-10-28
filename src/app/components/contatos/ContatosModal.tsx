'use client';

import React, { useState } from 'react';
import styles from './modal.module.scss';
import { toast } from 'sonner';

type ContactData = {
  name: string;
  email?: string;
  telefone?: string;
  receberEmail?: boolean;
  receberWhats?: boolean;
};

type Props = {
  onClose: () => void;
  onCreate: (data: ContactData) => Promise<void> | void;
};

export default function ContatosModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [receberEmail, setReceberEmail] = useState(true);
  const [receberWhats, setReceberWhats] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreate({ name, email, telefone, receberEmail, receberWhats });
      toast.success('Contato criado');
      onClose();
    } catch (err: any) {
      console.error('Erro ao criar contato', err);
      const message = err?.message || 'Erro ao criar contato';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <h3>Novo contato</h3>
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
            <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
