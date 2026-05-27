// Este componente gera um PDF a partir dos logs selecionados usando a biblioteca jsPDF.
export default function generatePdf(logs: Array<{
  descricao?: string;
  message?: string;
  created_at?: string;
  equipamento?: {
    id?: string;
    name?: string;
    description?: string;[key: string]: any
  };
  itens?: Array<{
    id?: string;
    descricao?: string; tipo?: string;
    indice?: number;
    zona?: any
  }>;[key: string]: any
}>) {
  const { jsPDF } = require("jspdf");
  const doc = new jsPDF();

  const selected = logs; // aqui você pode filtrar os logs que deseja incluir no PDF

  let y = 20;
  doc.setFontSize(16);
  doc.text("Relatório de Logs", 14, y);
  y += 10;

  doc.setFontSize(11);

  selected.forEach((l, idx) => {
    const descricao = `Supervisão: ${l.equipamento?.description ?? l.message ?? '-'}`;
    const header = `${idx + 1}. ${l.descricao ?? l.message ?? '-'} (${l.equipamento?.name ?? '-'})`;
    const created = `Data: ${l.created_at ?? l.timestamp ?? '-'} `;
    doc.text(descricao, 14, y);
    y += 6;
    doc.text(created, 14, y);
    y += 10;

    if (l.itens && l.itens.length > 0) {
      l.itens.forEach((item: { descricao?: string; tipo?: string; zona?: any }) => {
        const itemText = `- ${item.descricao ?? '-'} (Tipo: ${item.tipo ?? '-'}, Zona: ${item.zona ?? '-'})`;
        doc.text(itemText, 20, y);
        y += 6;
      });
      y += 4;
    }

    // Adiciona uma linha separadora
    doc.line(14, y, 196, y);
    y += 10;

    // Verifica se precisa adicionar uma nova página
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("relatorio_logs.pdf");
}