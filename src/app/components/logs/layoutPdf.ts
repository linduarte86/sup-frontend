// layout do pdf de logs.

import { jsPDF } from 'jspdf';
import axios from 'axios';

export async function renderHeader(doc: jsPDF, config: any, apiBase: string, toDataURL: (url: string, apiBase: string) => Promise<string | null>) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // título central e data/hora à direita
  doc.setFontSize(16);
  doc.text('Relatório de Logs', pageW / 2, 18, { align: 'center' } as any);
  const dataGeracao = new Date().toLocaleString('pt-BR');
  doc.setFontSize(9);
  doc.text(dataGeracao, pageW - 12, 18, { align: 'right' } as any);

  let headerX = 14;
  let headerY = 26; // topo do bloco do cabeçalho
  let headerHeight = 0;

  if (!config) {
    doc.setFontSize(14);
    doc.text('Logs selecionados', 14, headerY);
    return headerY + 16;
  }

  const title = String(config.empresaName ?? '');
  const contact = `${config.email ?? ''}${config.email ? ' | ' : ''}${config.telefone ?? ''}`.trim();
  const addr = String(config.endereco ?? '');

  // calcula alturas do bloco de texto e do logo
  const splitAddr = addr ? doc.splitTextToSize(addr, 140) : [];
  const textBlockHeight = addr ? (splitAddr.length * 6) + 20 : 20;
  const imgW = 36; const imgH = 36;
  const blockHeight = Math.max(imgH, textBlockHeight);

  const headerTop = headerY;
  const imageY = headerTop + (blockHeight - imgH) / 2;
  const textTop = headerTop + (blockHeight - textBlockHeight) / 2;
  const titleY = textTop + 6;
  const contactY = textTop + 14;
  const addrY = textTop + 20;

  if (config.logoUrl) {
    try {
      const proxied = `/api/logo?p=${encodeURIComponent(config.logoUrl)}&t=${Date.now()}`;
      console.log('renderHeader - proxied logo path:', proxied);
      // tenta via toDataURL fornecido
      let dataUrl: string | null = null;
      try {
        if (toDataURL) dataUrl = await toDataURL(proxied, apiBase);
      } catch (e) { console.error('toDataURL failed', e); }

      console.log('renderHeader - dataUrl present:', !!dataUrl, dataUrl ? `${dataUrl.substring(0,60)}... (len ${dataUrl.length})` : '');
      // fallback: fetch with credentials
      if (!dataUrl) {
        try {
          const backendBase = apiBase ?? window.location.origin;
          const absolute = proxied.startsWith('http') ? proxied : `${backendBase.replace(/\/$/, '')}${proxied}`;
          const resp = await fetch(absolute, { credentials: 'include', cache: 'no-store' });
          if (resp.ok) {
            const arrayBuffer = await resp.arrayBuffer();
            const base64 = (function ab2b64(buf: ArrayBuffer) {
              const bytes = new Uint8Array(buf);
              let binary = '';
              const chunkSize = 0x8000;
              for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunk = bytes.subarray(i, i + chunkSize);
                binary += String.fromCharCode.apply(null, Array.from(chunk));
              }
              return btoa(binary);
            })(arrayBuffer);
            dataUrl = `data:image/png;base64,${base64}`;
          }
        } catch (e) {
          console.error('fetch fallback for logo failed', e);
        }
      }

      if (dataUrl) {
        let fmt: any = 'PNG';
        if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/jpeg')) fmt = 'JPEG';
        else if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/png')) fmt = 'PNG';
        try { doc.addImage(dataUrl as string, fmt, 14, imageY, imgW, imgH); }
        catch (e) { try { (doc as any).addImage(dataUrl, 14, imageY, imgW, imgH); } catch (er) { /* ignore */ } }
        headerX = 14 + imgW + 8;
        headerHeight = imgH;
      }
    } catch (e) {
      headerX = 14;
    }
  }

  // desenha textos alinhados verticalmente ao centro do bloco
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(String(title || 'Logs selecionados'), headerX, titleY);
  doc.setFontSize(9);
  if (contact) doc.text(contact, headerX, contactY);
  if (addr) {
    doc.text(splitAddr, headerX, addrY);
    headerHeight = Math.max(headerHeight, textBlockHeight);
  } else {
    headerHeight = Math.max(headerHeight, 20);
  }

  // calcula bottom real do texto e da imagem e posiciona o separador abaixo
  const addrLines = splitAddr.length || 0;
  const addrBottom = addrY + Math.max(0, addrLines - 1) * 6 + 2;
  const imageBottom = imageY + imgH;
  const separatorY = Math.max(headerTop + blockHeight, addrBottom, imageBottom) + 12;
  doc.setLineWidth(0.5);
  doc.setDrawColor(0,0,0);
  doc.line(12, separatorY, pageW - 12, separatorY);

  return separatorY + 10; // y inicial para conteúdo
}

// helper wrapper to safely call provided toDataURL (which may be undefined)
async function toDataURLWrapper(url: string, apiBase: string, toDataURL?: (u: string, b: string) => Promise<string | null>) {
  try {
    if (toDataURL) return await toDataURL(url, apiBase);
    // fallback simple fetch
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('toDataURLWrapper error', e);
    return null;
  }
}

export function drawPageBorder(doc: jsPDF) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setLineWidth(0.6);
  doc.rect(8, 8, pageW - 16, pageH - 16);
}

export function addPageNumber(doc: jsPDF, page: number, total: number) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(9);
  doc.setTextColor(100,100,100);
  const txt = `Página ${page} de ${total}`;
  doc.text(txt, pageW - 12, pageH - 10, { align: 'right' } as any);
}