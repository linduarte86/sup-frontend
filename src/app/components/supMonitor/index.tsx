'use client';
import { useEffect, useState } from 'react';
import socket from '@/services/socket';
import styles from './supPainel.module.scss';


type StatusEquipamento = {
  equipamentoId: string;
  status: {
    SUPERVISAO: string;
    RESPOSTA: {
      falhasAmplificadores: string[];
      falhasLinhas: string[];
      statusReserva: string;
      statusGeral: string;
    };
  };
};

export default function PainelSupervisao() {
  const [equipamentos, setEquipamentos] = useState<StatusEquipamento[]>([]);
  
  useEffect(() => {

    // Solicita o status atual ao conectar
    socket.emit("getStatusAtual");

    // Escuta o status atual
    socket.on("statusAtual", (data: StatusEquipamento[]) => {
      setEquipamentos(data);
    });

    // Escuta atualizações de status
    socket.on("statusEquipamento", (data: StatusEquipamento) => {
      setEquipamentos((prev) => {
        const semDuplicado = prev.filter(e => e.equipamentoId !== data.equipamentoId);
        return [...semDuplicado, data];
      });
    });

    return () => {
      //socket.disconnect();
      socket.off("statusAtual");
      socket.off("statusEquipamento");
    };
  }, []);

  return (
    <div className={styles.container}>
      {equipamentos.map(eq => {
        const resp = eq.status.RESPOSTA;
        return (
          <div key={eq.equipamentoId} className={styles.card}>
            <h2 className={styles.titulo}>{eq.status.SUPERVISAO}</h2>

            <div className={styles.statusGroup}>
              <p>
                <strong>Status geral:</strong>{' '}
                <span className={resp.statusGeral === 'OK' ? styles.ok : styles.falha}>
                  {resp.statusGeral}
                </span>
              </p>

              <p>
                <strong>Amplificador reserva:</strong>{' '}
                <span className={resp.statusReserva === 'OK' ? styles.ok : styles.falha}>
                  {resp.statusReserva}
                </span>
              </p>
            </div>

            <div className={styles.grid}>
              <div>
                <h3 className={styles.subtitulo}>Amplificadores</h3>
                {resp.falhasAmplificadores.map((f, i) => (
                  <p key={i} className={f.includes('OK') ? styles.ok : styles.falha}>
                    CH{i + 1}: {f.split(': ')[1]}
                  </p>
                ))}
              </div>

              <div>
                <h3 className={styles.subtitulo}>Linhas</h3>
                {resp.falhasLinhas.map((f, i) => (
                  <p key={i} className={f.includes('OK') ? styles.ok : styles.falha}>
                    L{i + 1}: {f.split(': ')[1]}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
