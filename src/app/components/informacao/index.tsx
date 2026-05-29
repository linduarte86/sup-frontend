'use client';

// componente para exibir e atualizar informações do sistema.
// Usando os dados do endpoito /system-config e permitindo atualização via formulário.
/**
 * O endpoint (get) /system-config retorna um objeto com as seguintes propriedades:
 * {
 *   "id": "5546a34f-0597-42ff-892c-1e3306470b72",
 *   "empresaName": "Apel - Alicações Eletrônicas - LTDA",
 *   "logoUrl": "/uploads/logo-1779897980532.png",
 *   "email": "apel@apel.com.br",
 *   "telefone": "(83) 3331-2121",
 *   "endereco": "Av. Jorn. Assis Chateaubriand, 4193 - Distrito Industrial, Campina Grande - PB",
 *   "created_at": "26-05-2026 01:51:51",
 *   "update_at": "27-05-2026 13:06:20"
 * }
 *
 * O endpoint (put) /system-config atualiza as informações do sistema e envia a imagem do logo (se fornecida) e retorna o objeto atualizado.
 * O componente exibe as informações e permite editar e salvar, incluindo troca do logo.
 */

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import styles from './style.module.scss';
import { api } from '@/services/api';
import { toast } from 'sonner';

export default function Informacao() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    empresaName: '',
    email: '',
    telefone: '',
    endereco: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/system-config');
        if (!mounted) return;
        let data = res?.data ?? null;
        if (Array.isArray(data)) data = data.length > 0 ? data[0] : null;
        setConfig(data);
        if (data) {
          setForm({
            empresaName: data.empresaName ?? '',
            email: data.email ?? '',
            telefone: data.telefone ?? '',
            endereco: data.endereco ?? '',
          });
          // preview via proxy route se houver logo
          if (data.logoUrl) setPreviewSrc(`/api/logo?p=${encodeURIComponent(data.logoUrl)}`);
        }
      } catch (err) {
        console.error('Erro ao carregar informações do sistema:', err);
        toast.error('Erro ao carregar informações');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target as HTMLInputElement;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    // valida tamanho (2MB)
    if (f && f.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máx 2MB.');
      e.currentTarget.value = '';
      return;
    }
    setLogoFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setPreviewSrc(String(reader.result));
      reader.readAsDataURL(f);
    } else {
      if (config?.logoUrl) setPreviewSrc(`/api/logo?p=${encodeURIComponent(config.logoUrl)}`);
      else setPreviewSrc(null);
    }
  }

  function removeSelectedLogo() {
    setLogoFile(null);
    if (config?.logoUrl) setPreviewSrc(`/api/logo?p=${encodeURIComponent(config.logoUrl)}`);
    else setPreviewSrc(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // validação básica
    if (!form.empresaName?.trim()) return toast.error('Nome da empresa é obrigatório');
    if (!form.email?.trim()) return toast.error('Email é obrigatório');

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('empresaName', form.empresaName);
      fd.append('email', form.email);
      fd.append('telefone', form.telefone);
      fd.append('endereco', form.endereco);
      if (logoFile) fd.append('logo', logoFile);

      const targetUrl = config?.id ? `/system-config/${config.id}` : '/system-config';
      console.log('Informacao - PUT url:', targetUrl);
      const res = await api.put(targetUrl, fd);
      let data = res?.data ?? null;
      if (Array.isArray(data)) data = data.length > 0 ? data[0] : null;
      setConfig(data);
      if (data?.logoUrl) setPreviewSrc(`/api/logo?p=${encodeURIComponent(data.logoUrl)}&t=${Date.now()}`);
      toast.success('Informações salvas com sucesso');
      // limpa seleção de arquivo
      setLogoFile(null);
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      if (err?.response) {
        console.error('Erro response status:', err.response.status);
        console.error('Erro response headers:', err.response.headers);
        console.error('Erro response data:', err.response.data);
        const msg = err.response.data?.message || `Erro ao salvar (status ${err.response.status})`;
        toast.error(msg);
      } else {
        toast.error(err?.message || 'Erro ao salvar informações');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className={styles.container}>Carregando...</div>;

  return (
    <main className={styles.container}>
      <h3>Dados</h3>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', minWidth: 240 }}>
            <label className={styles.field}>
              <span className={styles.label}>Empresa</span>
              <input
                name="empresaName"
                value={form.empresaName}
                onChange={handleChange}
                placeholder="Nome da empresa"
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contato@empresa.com"
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Telefone</span>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(00) 0000-0000"
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Endereço</span>
              <textarea
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                placeholder="Endereço completo"
                className={styles.textarea}
                rows={3}
              />
            </label>
          </div>

          <div style={{ width: 220, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label className={styles.field} style={{ display: 'block' }}>
              <span className={styles.label}>Logo (máx 2MB)</span>
              <input type="file" accept="image/*" onChange={handleFile} className={styles.fileInput} />
            </label>

            <div style={{ border: '1px solid #e6e6e6', padding: 8, borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#444', marginBottom: 8 }}>Pré-visualização</div>
              {previewSrc ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <img src={previewSrc} alt="Preview logo" style={{ maxWidth: 160, maxHeight: 80, objectFit: 'contain', borderRadius: 4 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => setPreviewSrc(null)} className={styles.btnSecondary}>Limpar</button>
                    <button type="button" onClick={removeSelectedLogo} className={styles.btnSecondary}>Reverter</button>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#888', fontSize: 13 }}>Nenhuma imagem</div>
              )}
            </div>

            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Última atualização</div>
              <div style={{ fontSize: 13 }}>{config?.update_at ?? config?.created_at ?? '-'}</div>
            </div>
          </div>
        </div>

        <div className={styles.actions} style={{ marginTop: 18 }}>
          <button type="submit" disabled={saving} className={styles.primary}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </main>
  );
}
