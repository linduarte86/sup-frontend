'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import { initAlertService } from '@/services/alertService';
import { Megaphone } from 'lucide-react';
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
      console.log('Global alert:', falha);

      if (somAtivo && audio) {
        try {
          audio.currentTime = 0;
          await audio.play();
        } catch (err) {
          console.warn('Erro ao reproduzir o som:', err);
        }
      }

      //toast.error(`Nova falha ${falha}`);

      if (pathname !== '/supervisao') {
        toast.error(`Nova falha detectada: ${falha.equipamentoDescricao}`);
        router.push('/supervisao');
      }
    });
  }, [audio, somAtivo, router, pathname]);

  return (
    <div className={styles.container}>
      {!somAtivo ? (
        <button title='Ativar som de alerta' className={styles.botaoAtivar} onClick={() => setSomAtivo(true)}>
          <Megaphone/>
          Alerta
        </button>
      ) : (
        <p className={styles.ativo}>Alerta ativado</p>
      )}
    </div>
  );
}