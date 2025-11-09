'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import { initAlertService } from '@/services/alertService';
import styles from './SomAlerta.module.scss';

export function SomAlerta() {
  const [somAtivo, setSomAtivo] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Cria o objeto Audio apenas no navegador
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const newAudio = new Audio('/sounds/alert.mp3');
      newAudio.volume = 1;
      setAudio(newAudio);
    }
  }, []);

  useEffect(() => {
    initAlertService(async (falha) => {
      console.log('🚨 Global alert:', falha);

      if (somAtivo && audio) {
        try {
          audio.currentTime = 0;
          await audio.play();
        } catch (err) {
          console.warn('Erro ao reproduzir o som:', err);
        }
      }

      toast.error(`Nova falha: ${falha.mensagem}`);

      if (pathname !== '/supervisao') {
        router.push('/supervisao');
      }
    });
  }, [audio, somAtivo, router, pathname]);

  return (
    <div className={styles.container}>
      {!somAtivo ? (
        <button className={styles.botaoAtivar} onClick={() => setSomAtivo(true)}>
          Ativar som de alerta
        </button>
      ) : (
        <p className={styles.ativo}>✅ Som de alerta ativado</p>
      )}
    </div>
  );
}
