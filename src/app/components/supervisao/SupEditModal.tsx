'use client';

import React, { useState } from 'react';
import styles from './modal.module.scss';
import { toast } from 'sonner';

type Sup = {
  id?: string | number;
  name: string;
  modelo: number;
  description?: string;
  ip?: string;
  port?: number;
  ativo?: boolean;
};

type Props = {
  sup: Sup;
  onClose: () => void;
  onSave: (data: Sup) => Promise<void> | void;
};

export default function SupEditModal({ sup, onClose, onSave }: Props) {
  const [name, setName] = useState(sup.name ?? '');
  const [modelo, setModelo] = useState(sup.modelo ?? 1);
  const [description, setDescription] = useState(sup.description ?? '');
  const [ip, setIp] = useState(sup.ip ?? '');
  const [port, setPort] = useState<number | ''>(sup.port ?? '');
  const [ativo, setAtivo] = useState(!!sup.ativo);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Sup = {
        id: sup.id,
        name,
        modelo,
        description,
        ip,
        port: port === '' ? undefined : Number(port),
        ativo,
      };
      await onSave(payload);
      toast.success('Supervisão atualizada');
      onClose();
    } catch (err: any) {
      console.error('Erro ao atualizar supervisão', err);
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        toast.error(backendErrors.join('\n'));
      } else {
        toast.error(err?.response?.data?.message || err?.message || 'Erro ao atualizar');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <h3>Editar Supervisão</h3>
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
            <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
