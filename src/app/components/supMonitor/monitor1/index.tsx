'use client';
import { useEffect, useState } from 'react';
import socket from '@/services/socket';
import LEDStatus from "@/app/components/ledStatus/ledStatus"
import styles from './supPainel.module.scss';


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

export default function SupMonitor1() {
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

  return (
    <div className={styles.container}>
      {equipamentos.map(eq => {
        const resp = eq.status.RESPOSTA;
        return (
          <div key={eq.equipamentoId}
            className={`${styles.card} ${resp.statusGeral !== "OK" ? styles.falha : ""}`}>
            <h2 className={styles.titulo}>SUP - {eq.equipamentoDescricao}</h2>
            {/*}
            <div className={styles.ipPort}>
              <h4>{eq.equipamentoIP}:{eq.equipamentoPorta}</h4>
            </div>
            */}
            <div className={styles.statusBox}>

              <strong>STATUS GERAL:</strong>{' '}
              <span className={styles.status}>
                <LEDStatus status={
                  resp.statusGeral === "OK" ? "ok" :
                    mapStatus("alerta")} />
              </span>

            </div>
          </div>

        );
      })}
    </div>
  );
}
