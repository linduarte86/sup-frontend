'use client';
import { useEffect, useState } from 'react';
import socket from '@/services/socket';
import styles from './supPainel2.module.scss';
import LEDStatus from '../../ledStatus/ledStatus';


type StatusEquipamento = {
  equipamentoId: string;
  equipamentoIP?: string;
  equipamentoPorta?: number;
  equipamentoZona?: string[];
  equipamentoDescricao?: string;
  status: {
    SUPERVISAO: string;
    RESPOSTA: {
      falhasAmplificadores: string[];
      falhasLinhas: string[];
      statusReserva: string;
      statusGeral: string;
      zona?: string | string[];
    };
  };
};

// Função utilitária para normalizar diferentes formatos de zonas
function parseZones(value: any): string[] {
  if (!value && value !== 0) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    // Se for "id, nome" -> pega a parte após a vírgula
    if (value.includes(',') && value.split(',').length === 2) {
      const name = value.split(',')[1].trim();
      return name ? [name] : [value.trim()];
    }
    // Se for lista separada por vírgula/;| -> separar
    return value.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export default function SupMonitor2() {
  const [equipamentos, setEquipamentos] = useState<StatusEquipamento[]>([]);

  useEffect(() => {

    // normaliza objeto recebido para garantir equipamentoZona
    const normalize = (raw: any): StatusEquipamento => {
      const zonasFromTop = raw.equipamentoZona ?? raw.zona ?? raw.zonas ?? raw.Zonas;
      const zonasFromStatus = raw?.status?.RESPOSTA?.zona ?? raw?.RESPOSTA?.zona;
      const equipamentoZona = parseZones(zonasFromTop ?? zonasFromStatus);

      return {
        ...(raw as StatusEquipamento),
        equipamentoZona,
      } as StatusEquipamento;
    };

    // Solicita o status atual ao conectar
    socket.emit("getStatusAtual");

    // Escuta o status atual
    socket.on("statusAtual", (data: any[]) => {
      const normalized = Array.isArray(data) ? data.map(normalize) : [];
      setEquipamentos(normalized);
    });

    // Escuta atualizações de status
    socket.on("statusEquipamento", (data: any) => {
      const normalized = normalize(data);
      setEquipamentos((prev) => {
        const semDuplicado = prev.filter(e => e.equipamentoId !== normalized.equipamentoId);
        return [...semDuplicado, normalized];
      });
    });

    return () => {
      //socket.disconnect();
      socket.off("statusAtual");
      socket.off("statusEquipamento");
    };
  }, []);

  function mapStatus(str: string | undefined) {
    if (!str) return "desconhecido";
    const s = String(str).toLowerCase();
    if (s.includes("ok")) return "ok";
    if (s.includes("falha") || s.includes("erro")) return "falha";
    if (s.includes("alta")) return "alta";
    if (s.includes("baixa")) return "baixa";
    if (s.includes("aterramento")) return "aterramento";
    if (s.includes("alerta")) return "alerta";
    return "desconhecido";
  }

  return (
    <div className={styles.container}>
      {equipamentos.map((eq) => {
        const resp = eq.status.RESPOSTA;
        // garante 8 colunas (preenche vazio se necessário)
        const amps = Array.from({ length: 8 }, (_, i) => resp.falhasAmplificadores[i] ?? '');
        const linhas = Array.from({ length: 8 }, (_, i) => resp.falhasLinhas[i] ?? '');
        const zonas = Array.from({ length: 8 }, (_, i) => eq.equipamentoZona?.[i] ?? '');

        return (
          <div key={eq.equipamentoId} className={styles.card}>
            <h2 className={styles.title}>
              {eq.status.SUPERVISAO} — {eq.equipamentoDescricao}
            </h2>

            <div className={styles.ip}>
              {eq.equipamentoIP}:{eq.equipamentoPorta}
            </div>

            <div className={styles.headerStatus}>
              <div className={styles.headerItem}>
                <span className={styles.label}>Status Geral:</span>
                <LEDStatus status={
                  resp.statusGeral === "OK" ? "ok" :
                    mapStatus("alerta")} />
              </div>

              <div className={styles.headerItem}>
                <span className={styles.label}>Amplificador Reserva:</span>
                <LEDStatus status={mapStatus(resp.statusReserva)} />
              </div>
            </div>

            <table className={styles.tabela}>

              <tbody>
                <tr className={styles.zonasRow}>
                  <td className={styles.rowLabel}>ZONAS</td>
                  {Array.from({ length: 8 }, (_, i) => {
                    const zoneName = zonas[i] ?? '';
                    return (
                      <td key={i}>
                        <span
                          className={styles.zone}
                          data-zone={zoneName || `Zona ${i + 1}`}
                        >
                          {i + 1}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className={styles.rowLabel}>AMP</td>
                  {amps.map((item, i) => (
                    <td key={i}>
                      <LEDStatus status={mapStatus(item)} />
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className={styles.rowLabel}>LINHAS</td>
                  {linhas.map((item, i) => (
                    <td key={i}>
                      <LEDStatus status={resp.falhasLinhas[i].includes('Falha de aterramento') ? 'aterramento' :

                        mapStatus(item)} />
                    </td>
                  ))}
                </tr>
              </tbody>

            </table>
          </div>
        );
      })}
    </div>
  );
}