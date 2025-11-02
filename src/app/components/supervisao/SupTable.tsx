'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styles from './style.module.scss';
import { Edit3, Trash2, LayoutGrid } from 'lucide-react';
import { api } from '@/services/api';
import SupModal from './SupModal';
import SupEditModal from './SupEditModal';
import SupZonaEditModal from './SupZonaEditModal';
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

function getToken() {
  return document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1];
}

type NewSup = Omit<Sup, 'id'>;

export default function SupTable() {
  const [items, setItems] = useState<Sup[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Sup | null>(null);
  const [zonaEditing, setZonaEditing] = useState<Sup | null>(null);

  useEffect(() => { fetchSup(); }, []);

  async function fetchSup() {
    try {
      setLoading(true);
      const res = await api.get('/equipamentos', { headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' } });
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data?.items ?? []);
      setItems(data);
    } catch (err) {
      console.error('Erro fetch equipamentos', err);
    } finally { setLoading(false); }
  }

  async function handleCreate(data: NewSup) {
    try {
      await api.post('/equipamentos', data, { headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' } });
      toast.success('Supervisão criada');
      setOpenModal(false);
      fetchSup();
    } catch (err: any) {
      console.error('Erro criar supervisao', err);
      toast.error(err?.response?.data?.message || 'Erro ao criar');
    }
  }

  //adicionar listener para atualizar lista quando uma supervisão for criada pelo modal
    React.useEffect(() => {
      const onCreated = () => fetchSup();
      window.addEventListener('equipamentos:created', onCreated);
      return () => window.removeEventListener('equipamentos:created', onCreated);
    }, []);

  async function handleDelete(id?: string | number) {
    if (!confirm('Confirma exclusão?')) return;
    try {
      await api.delete(`/equipamentos/${id}`, { headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' } });
      toast.success('Excluído');
      fetchSup();
    } catch (err: any) {
      console.error('Erro ao excluir', err);
      toast.error('Não foi possível excluir');
    }
  }

  async function handleSave(updated: Sup) {
    try {
      await api.put(`/equipamentos/${updated.id}`, updated, { headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' } });
      window.dispatchEvent(new CustomEvent('equipamentos:created'));
      fetchSup();
    } catch (err: any) {
      console.error('Erro ao atualizar', err);
      throw err;
    }
  }

  async function setEditZona(updated: Sup) {
    try {
      // se o objeto já inclui `zonas` (ou `Zonas` vindo do backend), usa direto (evita chamada extra ao backend)
      const rawZonas = (updated as any).zonas ?? (updated as any).Zonas ?? null;
      if (rawZonas && Array.isArray(rawZonas)) {
        const mapped = rawZonas.map((z: any) => ({ numeroCanal: z.numeroCanal ?? z.numero_can ?? z.channel ?? 0, name: z.name ?? z.nome ?? '' }));
        setZonaEditing({ ...(updated as any), zonas: mapped });
        return;
      }

      setLoading(true);
      const res = await api.get(`/zonas/${updated.id}`, { headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' } });
      // normaliza resposta: pode vir array, ou { zonas: [...] }, ou { data: [...] }
      let zonasData: any[] = [];
      if (Array.isArray(res.data)) {
        zonasData = res.data;
      } else if (res.data && typeof res.data === 'object') {
        zonasData = res.data?.zonas ?? res.data?.Zonas ?? res.data?.data ?? res.data?.items ?? [];
      } else {
        zonasData = [];
      }

      const mapped = zonasData.map((z: any) => ({ numeroCanal: z.numeroCanal ?? z.numero_can ?? z.channel ?? 0, name: z.name ?? z.nome ?? '' }));

      setZonaEditing({ ...(updated as any), zonas: mapped });
    } catch (err: any) {
      console.error('Erro ao carregar zonas', err);
      toast.error('Não foi possível carregar zonas');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleSaveZonas(payload: { id: string | number; zonas: { numeroCanal: number; name: string }[] }) {
    try {
      const headers = { Authorization: getToken() ? `Bearer ${getToken()}` : '' };
      await api.put(`/zonas/${payload.id}`, { zonas: payload.zonas }, { headers });
      toast.success('Zonas salvas');
      setZonaEditing(null);
      fetchSup();
    } catch (err: any) {
      console.error('Erro ao salvar zonas', err);
      toast.error(err?.response?.data?.message || 'Erro ao salvar zonas');
      throw err;
    }
  }

  const filtered = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    const q = String(query ?? '').trim().toLowerCase();
    if (!q) return arr;
    return arr.filter(s => String(s.name ?? '').toLowerCase().includes(q) || String(s.ip ?? '').toLowerCase().includes(q));
  }, [items, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages]);

  const paginated = useMemo(() => { const start = (page - 1) * pageSize; return filtered.slice(start, start + pageSize); }, [filtered, page, pageSize]);

  return (
    <div className={styles.tableWrap}>
      <div className={styles.headerRow}>
        <h2>Supervisões</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div>{loading ? 'Carregando...' : `${total} supervisões`}</div>
        </div>
      </div>

      <div className={styles.controlsRow}>
        <input placeholder="Buscar por nome ou IP..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className={styles.searchInput} />
        <div className={styles.pageSizeWrap}>
          <label htmlFor="pageSize">Por página:</label>
          <select id="pageSize" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Modelo</th>
            <th>Descrição</th>
            <th>IP</th>
            <th>Porta</th>
            <th style={{ width: 130 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 && !loading ? (
            <tr><td colSpan={4} className={styles.empty}>Nenhuma supervisão encontrada</td></tr>
          ) : (
            paginated.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.modelo}</td>
                <td>{s.description}</td>
                <td>{s.ip ?? '-'}</td>
                <td>{s.port}</td>
                <td>
                  <button className={styles.iconBtn} onClick={() => setEditZona(s)} aria-label="Editar"><LayoutGrid size={16} /></button>
                  <button className={styles.iconBtn} onClick={() => setEditing(s)} aria-label="Editar"><Edit3 size={16} /></button>
                  <button className={styles.iconBtn} onClick={() => handleDelete(s.id)} aria-label="Deletar"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button className={styles.pageBtn} onClick={() => setPage(1)} disabled={page === 1}>«</button>
        <button className={styles.pageBtn} onClick={() => setPage(page - 1)} disabled={page === 1}>‹</button>
        <span className={styles.pageInfo}>Página {page} de {totalPages}</span>
        <button className={styles.pageBtn} onClick={() => setPage(page + 1)} disabled={page === totalPages}>›</button>
        <button className={styles.pageBtn} onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
      </div>

      {openModal && <SupModal onClose={() => setOpenModal(false)} onCreate={handleCreate} />}
      {editing && <SupEditModal sup={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
      {zonaEditing && (
        <SupZonaEditModal
          id={zonaEditing.id as string | number}
          zonas={(zonaEditing as any).zonas ?? []}
          onClose={() => setZonaEditing(null)}
          onSave={handleSaveZonas}
        />
      )}
    </div>
  );
}