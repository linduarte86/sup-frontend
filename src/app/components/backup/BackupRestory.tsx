'use client';

import React, { useRef } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";
import styles from "./style.module.scss";
import { DatabaseBackup, ArchiveRestore } from 'lucide-react';

function getToken() {
  return document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1];
}

// Componente para Gerar e Restaurar Backup
export default function BackupRestory() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Função para gerar backup
  const handleGenerateBackup = async () => {

    // Confirmação antes de gerar
    if (!confirm('Deseja realmente gerar um backup do sistema?')) return;

    try {
      const response = await api.get('/backup/download', {
        headers: { Authorization: getToken() ? `Bearer ${getToken()}` : '' },
        responseType: 'blob', // Importante para downloads
      });

      // Cria um link para download do arquivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'backup.zip'); // Nome do arquivo de backup
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      toast.success('Backup gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar backup:', error);
      toast.error('Falha ao gerar backup.');
    }
  };

  // Função para restaurar backup
  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement> | File | null) => {
    let file: File | undefined;
    if (!event) return;
    if (event instanceof File) file = event;
    else file = event.target.files?.[0];
    if (!file) return;

    // confirmação antes de restaurar
    if (!confirm('Tem certeza que deseja restaurar o backup? Esta ação é irreversível.')) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/backup/restore', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: getToken() ? `Bearer ${getToken()}` : ''
        },
      });

      toast.success('Backup restaurado com sucesso!');
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast.error('Falha ao restaurar backup.');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Gerar e Restaurar Backup</h2>

      <div className={styles.gerarBackup}>
        <button onClick={handleGenerateBackup} className={styles.buttonBackup}>
          <DatabaseBackup size={20} style={{ marginRight: 8 }} /> Gerar Backup
        </button>
      </div>

      <div className={styles.restoreBackup}>
        <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.buttonRestory}>
          <ArchiveRestore size={20} style={{ marginRight: 8 }} /> Restaurar Backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          id="restore-backup"
          accept=".zip"
          onChange={handleRestoreBackup}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}


