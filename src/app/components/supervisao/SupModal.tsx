'use client';

import React, { useState } from 'react';
import styles from './modal.module.scss';
import { toast } from 'sonner';

type SupData = {
  name: string;
  modelo: number;
  description?: string;
  ip?: string;
  port?: number;
  ativo?: boolean;
};

type Props = {
  onClose: () => void;
  onCreate: (data: SupData) => Promise<void> | void;
};

export default function SupModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [modelo, setModelo] = useState(1);
  const [description, setDescription] = useState('');
  const [ip, setIp] = useState('');
  const [port, setPort] = useState<number | ''>('');
  const [ativo, setAtivo] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreate({ name, modelo, description, ip, port: port === '' ? undefined : Number(port), ativo });
      toast.success('Supervisão criada');
      onClose();
    } catch (err: any) {
      console.error('Erro criar supervisão', err);
      toast.error(err?.message || err?.response?.data?.message || 'Erro ao criar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <h3>Nova Supervisão</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">×</button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Nome
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label>
            Modelo
            <select value={String(modelo)} onChange={(e) => setModelo(Number(e.target.value))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>

          <label>
            Descrição
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>

          <label>
            IP
            <input value={ip} onChange={(e) => setIp(e.target.value)} />
          </label>

          <label>
            Porta
            <input value={port === '' ? '' : String(port)} onChange={(e) => setPort(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>

          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} /> Ativo
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
