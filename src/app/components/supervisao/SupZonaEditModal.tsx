'use client';

import React, { useState } from 'react';
import styles from './modal.module.scss';
import { toast } from 'sonner';

type Zonas = {
  numeroCanal: number;
  name: string;
};

type Props = {
  id: string | number;
  zonas?: Zonas[];
  onClose: () => void;
  onSave: (payload: { id: string | number; zonas: Zonas[] }) => Promise<void> | void;
};

export default function SupZonaEditModal({ id, zonas = [], onClose, onSave }: Props) {
  // inicializa com 8 canais (1..8) usando os nomes vindos em `zonas` quando disponíveis
  const initial = Array.from({ length: 8 }, (_, i) => {
    const num = i + 1;
    const found = zonas.find(z => z.numeroCanal === num);
    return found?.name ?? '';
  });

  const [names, setNames] = useState<string[]>(initial);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(index: number, value: string) {
    setNames(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payloadZonas: Zonas[] = names.map((name, i) => ({ numeroCanal: i + 1, name }));
      await onSave({ id, zonas: payloadZonas });
      toast.success('Zonas atualizadas');
      onClose();
    } catch (err: any) {
      console.error('Erro ao atualizar zonas', err);
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        toast.error(backendErrors.join('\n'));
      } else {
        toast.error(err?.response?.data?.message || err?.message || 'Erro ao atualizar zonas');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <h3>Editar Zonas</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">×</button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {names.map((nm, idx) => (
              <label key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                Canal {idx + 1}
                <input value={nm} onChange={(e) => handleChange(idx, e.target.value)} />
              </label>
            ))}
          </div>

          <div className={styles.actions} style={{ marginTop: 12 }}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
