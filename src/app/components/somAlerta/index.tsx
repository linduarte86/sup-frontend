'use client';

import React, { useEffect, useRef, useState } from 'react';
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

  const jaNotificouRef = useRef(false);
  const somAtivoRef = useRef(false);
  const pathnameRef = useRef(pathname);
  const prevPathnameRef = useRef(pathname);

  // mantém refs atualizadas
  useEffect(() => {
    somAtivoRef.current = somAtivo;
  }, [somAtivo]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // cria o áudio uma vez
  useEffect(() => {
    const newAudio = new Audio('/sounds/alert.mp3');
    newAudio.volume = 1;
    setAudio(newAudio);
  }, []);

  // registra o serviço UMA ÚNICA VEZ
  useEffect(() => {
    initAlertService(async (falha) => {
      console.log('Global alert:', falha);

      // som
      if (somAtivoRef.current && audio) {
        try {
          audio.currentTime = 0;
          await audio.play();
        } catch (err) {
          console.warn('Erro ao reproduzir o som:', err);
        }
      }

      // evita múltiplos toasts
      if (jaNotificouRef.current) return;

      if (pathnameRef.current !== '/supervisao') {
        jaNotificouRef.current = true;

        toast.error(`Nova falha detectada: ${falha.equipamentoDescricao}`);

        router.push('/supervisao');
      }
    });
  }, [audio, router]);

  useEffect(() => {
    if (prevPathnameRef.current === '/supervisao' && pathname !== '/supervisao') {
      jaNotificouRef.current = false;
    }
    prevPathnameRef.current = pathname;
  }, [pathname]);


  return (
    <div className={styles.container}>
      {!somAtivo ? (
        <button title='Ativar som de alerta' className={styles.botaoAtivar} onClick={() => setSomAtivo(true)}>
          <Megaphone />
          Alerta
        </button>
      ) : (
        <p className={styles.ativo}>Alerta ativado</p>
      )}
    </div>
  );
}