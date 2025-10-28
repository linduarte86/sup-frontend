'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styles from '@/app/components/contatos/style.module.scss';
import { api } from '@/services/api';
import ContatoModal from './ContatosModal';
import ContatosEditModal from './ContatosEditModal';
import { toast } from 'sonner';
import { Edit3, Trash2 } from 'lucide-react';

type Contact = {
  id: string | number;
  name: string;
  email?: string;
  telefone?: string;
  receberEmail?: boolean;
  receberWhats?: boolean;
};

function getToken() {
  return document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1];
}

type NewContact = Omit<Contact, 'id'>;

export default function ContatosTable() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => { fetchContacts(); }, []);

  async function fetchContacts() {
    try {
      setLoading(true);

      const res = await api.get('/contatos', { headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' } });
      // Normaliza a resposta do backend para sempre ter um array de contatos
      let data: any = res.data;
      if (!Array.isArray(data)) {
        if (data && Array.isArray(data.data)) data = data.data;
        else if (data && Array.isArray(data.items)) data = data.items;
        else data = [];
      }
      setContacts(data || []);
    } catch (err) {
      console.error('Erro ao buscar contatos', err);
    } finally { setLoading(false); }
  }

  // Adiciona listener para atualizar lista quando um contato for criado pelo modal
    React.useEffect(() => {
      const onCreated = () => fetchContacts();
      window.addEventListener('contatos:created', onCreated);
      return () => window.removeEventListener('contatos:created', onCreated);
    }, []);

  async function handleCreate(data: NewContact) {
    try {
      
      await api.post('/contatos', data, { headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' } });
      toast.success('Contato criado');
      setOpenModal(false);
      fetchContacts();
    } catch (err: any) {
      console.error('Erro criar contato', err);
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) toast.error(backendErrors.join('\n'));
      else toast.error(err?.response?.data?.message || 'Erro ao criar contato');
    }
  }

  async function handleDelete(id: string | number) {
    if (!confirm('Confirma exclusão do contato?')) return;
    try {
      
      await api.delete(`/contatos/${id}`, { headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' } });
      toast.success('Contato excluído');
      fetchContacts();
    } catch (err: any) {
      console.error('Erro ao excluir contato', err);
      toast.error(err?.response?.data?.message || 'Erro ao excluir contato');
    }
  }

  async function handleSave(updated: NewContact & { id?: string | number }) {
    try {
      
      await api.put(`/contatos/${updated.id}`, updated, { headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' } });
      window.dispatchEvent(new CustomEvent('contacts:created'));
      fetchContacts();
    } catch (err: any) {
      console.error('Erro ao atualizar contato', err);
      throw err;
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => String(c.name).toLowerCase().includes(q) || String(c.email ?? '').toLowerCase().includes(q) || String(c.telefone ?? '').toLowerCase().includes(q));
  }, [contacts, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages]);

  const paginated = useMemo(() => {
    const arr = Array.isArray(filtered) ? filtered : [];
    const start = (page - 1) * pageSize;
    return arr.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div className={styles.tableWrap}>
      <div className={styles.headerRow}>
        <h2>Contatos</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div>{loading ? 'Carregando...' : `${total} contatos`}</div>
        </div>
      </div>

      <div className={styles.controlsRow}>
        <input placeholder="Buscar por nome, e-mail ou telefone..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className={styles.searchInput} />
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
            <th>E-mail</th>
            <th>Telefone</th>
            <th style={{ width: 120 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(paginated) && paginated.length === 0 && !loading ? (
            <tr><td colSpan={4} className={styles.empty}>Nenhum contato encontrado</td></tr>
          ) : (
            paginated.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email ?? '-'}</td>
                <td>{c.telefone ?? '-'}</td>
                <td>
                  <button className={styles.iconBtn} onClick={() => setEditingContact(c)} aria-label="Editar">
                    <Edit3 size={16} />
                  </button>
                  <button className={styles.iconBtn} onClick={() => handleDelete(c.id)} aria-label="Deletar">
                    <Trash2 size={16} />
                  </button>
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

      {openModal && <ContatoModal onClose={() => setOpenModal(false)} onCreate={handleCreate} />}
      {editingContact && (
        <ContatosEditModal contact={editingContact} onClose={() => setEditingContact(null)} onSave={handleSave} />
      )}
    </div>
  );
}
