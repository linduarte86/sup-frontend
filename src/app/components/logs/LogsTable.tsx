'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styles from './style.module.scss';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

function getToken() {
  return document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1];
}

type Log = {
  id?: string | number;
  descricao?: string; // usado pelo backend
  message?: string;
  created_at?: string;
  equipamento?: { id?: string; name?: string;[key: string]: any };
  itens?: Array<{ id?: string; descricao?: string; tipo?: string; indice?: number; zona?: any }>;
  [key: string]: any;
};

export default function LogsTable() {
  const [items, setItems] = useState<Log[]>([]);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { fetchLogs(); }, []);

  function toggleExpand(id?: string | number) {
    if (id == null) return;
    const key = String(id);
    setExpandedIds(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleSelect(id?: string | number) {
    if (id == null) return;
    const key = String(id);
    setSelectedIds(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSelectAllVisible(selectAll: boolean) {
    const ids = filtered.map(it => String(it.id));
    setSelectedIds(prev => {
      const copy = { ...prev };
      ids.forEach(id => { copy[id] = selectAll; });
      return copy;
    });
  }

  async function generatePdf() {
    const selected = items.filter(i => selectedIds[String(i.id)]);
    if (!selected || selected.length === 0) return toast.error('Nenhum log selecionado');

    const doc = new jsPDF();
    let y = 12;
    doc.setFontSize(14);
    doc.text('Logs selecionados', 14, y);
    y += 8;
    doc.setFontSize(11);

    selected.forEach((l, idx) => {
      const header = `${idx + 1}. ${l.descricao ?? l.message ?? '-'} (${l.equipamento?.name ?? '-'})`;
      const created = `Data: ${l.created_at ?? l.timestamp ?? '-'} `;
      doc.text(header, 14, y);
      y += 6;
      doc.text(created, 14, y);
      y += 6;
      if (Array.isArray(l.itens) && l.itens.length > 0) {
        l.itens.forEach(it => {
          const line = `- ${it.tipo ?? ''}: ${it.descricao ?? ''} (Zona: ${it.zona?.name ?? '-'})`;
          const split = doc.splitTextToSize(line, 180);
          doc.text(split, 16, y);
          y += (split.length * 6);
          if (y > 280) { doc.addPage(); y = 12; }
        });
      }
      y += 6;
      if (y > 280) { doc.addPage(); y = 12; }
    });

    doc.save('logs.pdf');
  }

  async function fetchLogs() {
    try {
      setLoading(true);
      const res = await api.get('/logs', { headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' } });
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data?.items ?? []);
      setItems(data);
    } catch (err) {
      console.error('Erro fetch logs', err);
      toast.error('Erro ao carregar logs');
    } finally { setLoading(false); }
  }

  async function handleDelete(id?: string | number) {
    if (!confirm('Confirma exclusão do log?')) return;
    try {
      await api.delete(`/logs/${id}`, { headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' } });
      toast.success('Excluído');
      fetchLogs();
    } catch (err: any) {
      console.error('Erro ao excluir log', err);
      toast.error('Não foi possível excluir');
    }
  }

  async function handleDeleteAll() {
    if (!confirm('Confirma exclusão de TODOS os logs? Esta ação não pode ser desfeita.')) return;
    try {
      setLoading(true);
      await api.delete('/logs', { headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' } });
      toast.success('Todos os logs foram excluídos');
      setSelectedIds({});
      fetchLogs();
    } catch (err: any) {
      console.error('Erro ao excluir todos os logs', err);
      toast.error('Não foi possível excluir todos os logs');
    } finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    const q = String(query ?? '').trim().toLowerCase();
    if (!q) return arr;
    return arr.filter(l =>
      String(l.descricao ?? l.message ?? l.msg ?? l.description ?? '').toLowerCase().includes(q) ||
      String(l.created_at ?? '').toLowerCase().includes(q) ||
      String(l.equipamento?.name ?? '').toLowerCase().includes(q) ||
      (Array.isArray(l.itens) && l.itens.some(it => String(it.descricao ?? '').toLowerCase().includes(q)))
    );
  }, [items, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages]);

  const paginated = useMemo(() => { const start = (page - 1) * pageSize; return filtered.slice(start, start + pageSize); }, [filtered, page, pageSize]);

  return (
    <div className={styles.tableWrap}>
      <div className={styles.headerRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div>{loading ? 'Carregando...' : `${total} registros`}</div>
        </div>
      </div>

      <div className={styles.controlsRow}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={filtered.length > 0 && filtered.every(it => !!selectedIds[String(it.id)])}
              onChange={(e) => handleSelectAllVisible(e.target.checked)}
            />
            Selecionar todos
          </label>
          <button type="button" onClick={generatePdf} className={styles.btnPDF}>Gerar PDF</button>

        </div>
        <input placeholder="Buscar por data" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className={styles.searchInput} />
        <div className={styles.pageSizeWrap}>
          <label htmlFor="pageSize">Por página:</label>
          <select id="pageSize" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <button type="button" title="Excluir todos os logs" onClick={handleDeleteAll} className={styles.btnDeleteAll}>
          <Trash2 />
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 40 }}></th>
            <th>Descrição</th>
            <th>Equipamento</th>
            <th>Falhas</th>
            <th>Data</th>
            <th style={{ width: 80 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 && !loading ? (
            <tr><td colSpan={6} className={styles.empty}>Nenhum log encontrado</td></tr>
          ) : (
            paginated.map((l) => {
              const isExpanded = !!expandedIds[String(l.id)];
              return (
                <React.Fragment key={String(l.id)}>
                  <tr>
                    <td>
                      <input type="checkbox" checked={!!selectedIds[String(l.id)]} onChange={() => toggleSelect(l.id)} />
                    </td>
                    <td style={{ whiteSpace: 'pre-wrap' }}>{String(l.descricao ?? l.message ?? l.msg ?? l.description ?? '-')}</td>
                    <td>{l.equipamento?.name ?? '-'}</td>
                    <td style={{ whiteSpace: 'pre-wrap' }}>{(Array.isArray(l.itens) && l.itens.length > 0) ? l.itens.map(it => `${it.tipo ?? ''}: ${it.descricao ?? ''}`).join('\n') : '-'}</td>

                    <td>{l.created_at ?? l.timestamp ?? '-'}</td>
                    <td>
                      <button className={styles.iconBtn} onClick={() => toggleExpand(l.id)} aria-label="Detalhes">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button className={styles.iconBtn} onClick={() => handleDelete(l.id)} aria-label="Deletar"><Trash2 size={16} /></button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={6}>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <div style={{ minWidth: 220 }}>
                            <strong>Equipamento</strong>
                            <div>Nome: {l.equipamento?.name ?? '-'}</div>
                            <div>Modelo: {l.equipamento?.modelo ?? '-'}</div>
                            <div>Descrição: {l.equipamento?.description ?? '-'}</div>
                            <div>IP: {l.equipamento?.ip ?? '-'}</div>
                            <div>Porta: {l.equipamento?.port ?? '-'}</div>
                            <div>Ativo: {String(l.equipamento?.ativo ?? '-')}</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <strong>Falhas</strong>

                            {Array.isArray(l.itens) && l.itens.length > 0 ? (
                              <ul>
                                {l.itens.map((it) => (
                                  <li key={it.id}>
                                    <div><strong>{it.tipo ?? ''}</strong> — {it.descricao ?? ''}</div>
                                    {it.zona && <div style={{ fontSize: 15, color: '#ff0000ff' }}>Zona: {it.zona?.name ?? it.zona?.nome ?? '-'}</div>}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div>Nenhum item</div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
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
    </div>
  );
}
