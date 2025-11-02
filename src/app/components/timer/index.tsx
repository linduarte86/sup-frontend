'use client';

import React, { useEffect, useState } from 'react';
import styles from './style.module.scss';
import { api } from '@/services/api';
import { toast } from 'sonner';

function getToken() {
  return document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1];
}

type TempoMensagem = { id?: string | number; tempo: number };
type TimeJob = { id?: string | number; intervalo_ms: number };

export default function TimePage() {
  const [tempoMsg, setTempoMsg] = useState<TempoMensagem | null>(null);
  const [timeJob, setTimeJob] = useState<TimeJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingTempo, setSavingTempo] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const tokenHeader = getToken() ? { Authorization: `Bearer ${getToken()}` } : {};

      // busca tempo de envio de mensagens
      const resTempo = await api.get('/tempo-mensagem', { headers: tokenHeader });
      let dataTempo: any[] = [];
      if (Array.isArray(resTempo.data)) {
        dataTempo = resTempo.data;
      } else if (resTempo.data && typeof resTempo.data === 'object') {
        // pode ser { tempo: 60000 } ou { data: [...] }
        if (resTempo.data.tempo !== undefined || resTempo.data.id !== undefined) {
          dataTempo = [resTempo.data];
        } else {
          dataTempo = resTempo.data?.data ?? resTempo.data?.items ?? [];
        }
      } else {
        dataTempo = [];
      }
      setTempoMsg(dataTempo[0] ?? null);

      // busca time job
      const resJob = await api.get('/timejob', { headers: tokenHeader });
      let dataJob: any[] = [];
      if (Array.isArray(resJob.data)) {
        dataJob = resJob.data;
      } else if (resJob.data && typeof resJob.data === 'object') {
        if (resJob.data.intervalo_ms !== undefined || resJob.data.id !== undefined) {
          dataJob = [resJob.data];
        } else {
          dataJob = resJob.data?.data ?? resJob.data?.items ?? [];
        }
      } else {
        dataJob = [];
      }
      setTimeJob(dataJob[0] ?? null);
    } catch (err: any) {
      console.error('Erro ao carregar timers', err);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTempo() {
    if (!tempoMsg) return toast.error('Registro de tempo não encontrado');
    try {
      setSavingTempo(true);

      const headers = getToken() ? { Authorization: `Bearer ${getToken()}` } : {};

      if (tempoMsg.id != null) {
        // atualizar
        await api.put(`/tempo-mensagem/${tempoMsg.id}`, { tempo: Number(tempoMsg.tempo) }, { headers });
      }

      toast.success('Tempo de mensagem atualizado');
      await fetchAll();
    } catch (err: any) {
      console.error('Erro ao salvar tempo-mensagem', err);
      toast.error(err?.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSavingTempo(false);
    }
  }

  async function handleSaveJob() {
    if (!timeJob) return toast.error('Registro do time job não encontrado');
    try {
      setSavingJob(true);

      const headers = getToken() ? { Authorization: `Bearer ${getToken()}` } : {};

      if (timeJob.id != null) {
        // atualizar
        await api.put(`/timejob/${timeJob.id}`, { intervalo_ms: Number(timeJob.intervalo_ms) }, { headers });
      } 

      toast.success('Time Job atualizado');
      await fetchAll();
    } catch (err: any) {
      console.error('Erro ao salvar timejob', err);
      toast.error(err?.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSavingJob(false);
    }
  }

  return (

      <div className={styles.cards}>
        <section className={styles.card}>
          <h2>Tempo de envio de Mensagens</h2>
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <>
              <div className={styles.field}>
                <label>Tempo (ms)</label>
                <input
                  type="number"
                  value={tempoMsg?.tempo ?? ''}
                  onChange={(e) => setTempoMsg(prev => ({ ...(prev ?? { tempo: 0 }), tempo: e.target.value === '' ? 0 : Number(e.target.value) }))}
                />
              </div>
              <div className={styles.actions}>
                <button onClick={handleSaveTempo} disabled={savingTempo || loading}>{savingTempo ? 'Atualizando...' : 'Atualizar'}</button>
              </div>
            </>
          )}
        </section>

        <section className={styles.card}>
          <h2>Time Job</h2>
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <>
              <div className={styles.field}>
                <label>Intervalo (ms)</label>
                <input
                  type="number"
                  value={timeJob?.intervalo_ms ?? ''}
                  onChange={(e) => setTimeJob(prev => ({ ...(prev ?? { intervalo_ms: 0 }), intervalo_ms: e.target.value === '' ? 0 : Number(e.target.value) }))}
                />
              </div>
              <div className={styles.actions}>
                <button onClick={handleSaveJob} disabled={savingJob || loading}>{savingJob ? 'Atualizando...' : 'Atualizar'}</button>
              </div>
            </>
          )}
        </section>
      </div>
   
  );
}