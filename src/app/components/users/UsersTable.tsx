'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styles from './style.module.scss';
import { Edit3, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import UserEditModal from './UserEditModal';
import { toast } from 'sonner';

type User = {
  id: string | number;
  name: string;
  email?: string;
  nivel?: string;
};

export default function UsersTable({ initialUsers }: { initialUsers?: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers ?? []);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  //const router = useRouter();

  useEffect(() => {
    if (!initialUsers) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1];
      const res = await api.get('/users', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      setUsers(res.data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários', error);
    }
  };

  // Adiciona listener para atualizar lista quando um usuário for criado pelo modal
  React.useEffect(() => {
    const onCreated = () => fetchUsers();
    window.addEventListener('users:created', onCreated);
    return () => window.removeEventListener('users:created', onCreated);
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [page, query]);

  function handleEdit(id: string | number) {
    const u = users.find((x) => String(x.id) === String(id));
    if (u) setEditingUser(u);
  }

  function handleSaved(updated: User) {
    setUsers((s) => s.map((u) => (String(u.id) === String(updated.id) ? updated : u)));
  }

  async function handleDelete(id: string | number) {
    if (!confirm('Confirma remoção do usuário?')) return;
    try {
      const getToken = () => {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.split('; ').find((c) => c.startsWith('session='));
        return match ? decodeURIComponent(match.split('=')[1]) : null;
      };
      const token = getToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await api.delete(`/users/${id}`, config);
      if (!res || res.status >= 400) throw new Error('Erro ao deletar');
      setUsers((s) => s.filter((u) => String(u.id) !== String(id)));
      toast.success('Usuário removido');
    } catch (err) {
      console.error('delete error:', err);
      toast.error('Não foi possível remover o usuário');
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      String(u.name).toLowerCase().includes(q) ||
      String(u.email ?? '').toLowerCase().includes(q) ||
      String(u.id).toLowerCase().includes(q)
    );
  }, [users, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  function gotoPage(n: number) {
    const p = Math.max(1, Math.min(totalPages, n));
    setPage(p);
  }

  return (
    <div className={styles.tableWrap}>
      <div className={styles.headerRow}>
        <h2>Usuários</h2>
        <div>{loading ? 'Carregando...' : `${total} usuários`}</div>
      </div>

      <div className={styles.controlsRow}>
        <input
          placeholder="Buscar por nome, e-mail ou id..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          className={styles.searchInput}
        />

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
            <th>Nível</th>
            <th style={{ width: 120 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(paginated) && paginated.length === 0 && !loading ? (
            <tr>
              <td colSpan={3} className={styles.empty}>Nenhum usuário encontrado</td>
            </tr>
          ) : (
            paginated.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email ?? '-'}</td>
                <td>{u.nivel ?? '-'}</td>
                <td>
                  <button className={styles.iconBtn} onClick={() => handleEdit(u.id)} aria-label="Editar">
                    <Edit3 size={16} />
                  </button>
                  <button className={styles.iconBtn} onClick={() => handleDelete(u.id)} aria-label="Deletar">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={(u) => { handleSaved(u); setEditingUser(null); }}
        />
      )}

      <div className={styles.pagination}>
        <button className={styles.pageBtn} onClick={() => gotoPage(1)} disabled={page === 1}>«</button>
        <button className={styles.pageBtn} onClick={() => gotoPage(page - 1)} disabled={page === 1}>‹</button>

        <span className={styles.pageInfo}>Página {page} de {totalPages}</span>

        <button className={styles.pageBtn} onClick={() => gotoPage(page + 1)} disabled={page === totalPages}>›</button>
        <button className={styles.pageBtn} onClick={() => gotoPage(totalPages)} disabled={page === totalPages}>»</button>
      </div>
    </div>
  );
}
