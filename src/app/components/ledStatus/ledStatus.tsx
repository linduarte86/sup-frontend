'use client';

import React from "react";
import { Check, X, AlertTriangle, HelpCircle } from "lucide-react";
import styles from "./styles.module.scss";

type StatusType = "ok" | "falha" | "alta" | "baixa" | "aterramento" | "alerta" | "desconhecido";

interface Props {
  status: StatusType;
}

export default function LEDStatus({ status }: Props) {
  
  const config = {
    ok: { text: "OK", icon: <Check size={16} /> },
    falha: { text: "FALHA", icon: <X size={16} /> },
    alta: { text: "ALTA", icon: <X size={16} /> },
    baixa: { text: "BAIXA", icon: <X size={16} /> },
    aterramento: { text: "TERRA", icon: <X size={16} /> },
    alerta: { text: "FALHAS", icon: <AlertTriangle size={16} /> },
    desconhecido: { text: "", icon: <HelpCircle size={16} /> }
  };

  const { text, icon } = config[status];

  return (
    <div className={`${styles.led} ${styles[status]}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}
