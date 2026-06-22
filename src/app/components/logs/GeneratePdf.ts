import { jsPDF } from 'jspdf';
import { api } from '@/services/apiServer';
import axios from 'axios';
import { toast } from 'sonner';
import { renderHeader, drawPageBorder, addPageNumber } from './layoutPdf';

function getToken() {
  return document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1];
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

async function toDataURL(url: string, apiBase: string) {
  try {
    const token = getToken();
    const origin = apiBase ?? window.location.origin;
    const isRelative = url.startsWith('/') || url.startsWith(origin);

    if (isRelative) {
      const backendBase = apiBase ?? window.location.origin;
      const absolute = url.startsWith('http') ? url : `${backendBase.replace(/\/$/, '')}${url}`;

      // proxy endpoint on frontend (same origin) - use fetch to preserve cookies
      if (url.startsWith('/api/')) {
        try {
          const resp = await fetch(absolute, { credentials: 'include', cache: 'no-store' });
          if (!resp.ok) {
            console.error('toDataURL: fetch proxy returned not ok', resp.status);
            return null;
          }
          const arrayBuffer = await resp.arrayBuffer();
          return `data:image/png;base64,${arrayBufferToBase64(arrayBuffer)}`;
        } catch (e) {
          console.error('toDataURL: proxy fetch failed', e);
          return null;
        }
      }

      const headers: Record<string, string> = { 'Cache-Control': 'no-cache' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      let resp = await fetch(absolute, { headers, mode: 'cors', cache: 'no-store' });
      if (resp.status === 304) {
        const absolute2 = `${absolute}${absolute.includes('?') ? '&' : '?'}t=${Date.now()}`;
        resp = await fetch(absolute2, { headers, mode: 'cors', cache: 'no-store' });
      }
      if (!resp.ok) return null;
      const arrayBuffer = await resp.arrayBuffer();
      return `data:image/png;base64,${arrayBufferToBase64(arrayBuffer)}`;
    }

    // external URL
    const headers: Record<string, string> = { 'Cache-Control': 'no-cache' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    let resp = await fetch(url, { headers, mode: 'cors', cache: 'no-store' });
    if (resp.status === 304) {
      const url2 = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
      resp = await fetch(url2, { headers, mode: 'cors', cache: 'no-store' });
    }
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('toDataURL error', e);
    return null;
  }
}

export async function generatePdf(selected: any[], systemConfig?: any | null) {
  if (!selected || selected.length === 0) return toast.error('Nenhum log selecionado');

  const apiBase = (api as any)?.defaults?.baseURL ?? (process.env.NEXT_PUBLIC_API_BACKEND_URL ?? null) ?? window.location.origin;
  console.log('GeneratePdf - apiBase:', apiBase);

  // obtain system config (use fetch with timestamp to avoid 304 cached without body)
  let cfg = systemConfig ?? null;
  if (!cfg) {
    try {
      const url = `${apiBase.replace(/\/$/, '')}/system-config?t=${Date.now()}`;
      const r = await fetch(url, { cache: 'no-store', mode: 'cors' });
      if (r.ok) {
        cfg = await r.json();
      }
    } catch (e) {
      console.error('GeneratePdf - failed fetching system-config', e);
      cfg = null;
    }
  }

  // normalize array
  const config = Array.isArray(cfg) ? (cfg.length > 0 ? cfg[0] : null) : cfg;
  console.log('GeneratePdf - config:', config);

  const doc = new jsPDF();
  let y = 12;
  const pagesWithContent: number[] = [];

  try {
    // desenha borda e cabeçalho na primeira página
    drawPageBorder(doc);
    // passe a origin do frontend para buscar /api/logo proxy corretamente
    y = await renderHeader(doc, config, window.location.origin, toDataURL);
    pagesWithContent.push(1);
  } catch (e) {
    console.error('GeneratePdf header error', e);
    doc.setFontSize(14);
    doc.text('Logs selecionados', 14, y);
    y += 8;
  }

  doc.setFontSize(11);

  const pageH = doc.internal.pageSize.getHeight();
  const contentBottom = pageH - 26; // margem inferior segura para evitar borda e numeração
  for (let idx = 0; idx < selected.length; idx++) {
    const l = selected[idx];
    const descricao = `${idx + 1}. Supervisão: ${l.equipamento?.description ?? l.message ?? '-'}`;
    const header = `${l.descricao ?? l.message ?? '-'} (${l.equipamento?.name ?? '-'})`;
    const created = `Data: ${l.created_at ?? l.timestamp ?? '-'} `;
    doc.text(descricao, 14, y);
    y += 6;
    const splitHeader = doc.splitTextToSize(header, 180);
    doc.text(splitHeader, 14, y);
    y += (splitHeader.length * 6);
    doc.text(created, 14, y);
    y += 6;
    if (Array.isArray(l.itens) && l.itens.length > 0) {
      for (let j = 0; j < l.itens.length; j++) {
        const it = l.itens[j];
        const line = `- ${it.tipo ?? ''}: ${it.descricao ?? ''} (Zona: ${it.zona?.name ?? '-'})`;
        const split = doc.splitTextToSize(line, 180);
        doc.text(split, 16, y);
        y += (split.length * 6);
        if (y > contentBottom) {
          doc.addPage();
          drawPageBorder(doc);
          y = 12;
          y = await renderHeader(doc, config, window.location.origin, toDataURL);
          pagesWithContent.push(doc.getNumberOfPages());
        }
      }
    }
    y += 6;
    if (y > contentBottom) {
      doc.addPage();
      drawPageBorder(doc);
      y = 12;
      y = await renderHeader(doc, config, window.location.origin, toDataURL);
      pagesWithContent.push(doc.getNumberOfPages());
    }
  }

  // adicionar paginação em cada página
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    addPageNumber(doc, p, total);
  }

  doc.save('logs.pdf');
}

export default generatePdf;
