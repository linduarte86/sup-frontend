import { jsPDF } from 'jspdf';
import { api } from '@/services/api';
import axios from 'axios';
import { toast } from 'sonner';

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

      // proxy endpoint on frontend (same origin) - use axios to get arraybuffer and preserve cookies
      if (url.startsWith('/api/')) {
        try {
          const resp = await axios.get(absolute, { responseType: 'arraybuffer', withCredentials: true });
          const arrayBuffer = resp.data as ArrayBuffer;
          const base64 = arrayBufferToBase64(arrayBuffer);
          return `data:image/png;base64,${base64}`;
        } catch (e) {
          console.error('toDataURL: axios proxy fetch failed', e);
          // fallback to fetch
          const resp = await fetch(absolute, { credentials: 'include', cache: 'no-store' });
          if (!resp.ok) return null;
          const arrayBuffer = await resp.arrayBuffer();
          return `data:image/png;base64,${arrayBufferToBase64(arrayBuffer)}`;
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

  try {
    let headerX = 14;
    let headerY = y;
    let headerHeight = 0;

    if (config) {
      const title = String(config.empresaName ?? '');
      const contact = `${config.email ?? ''}${config.email ? ' | ' : ''}${config.telefone ?? ''}`.trim();
      const addr = String(config.endereco ?? '');

      if (config.logoUrl) {
        const proxied = `/api/logo?p=${encodeURIComponent(config.logoUrl)}&t=${Date.now()}`;
        console.log('GeneratePdf - proxied logo path:', proxied);
        const dataUrl = await toDataURL(proxied, window.location.origin);
        console.log('GeneratePdf - dataUrl present:', !!dataUrl);
        if (dataUrl) {
          try {
            const imgW = 36;
            const imgH = 36;
            let fmt: any = 'PNG';
            if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/jpeg')) fmt = 'JPEG';
            else if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/png')) fmt = 'PNG';
            try {
              doc.addImage(dataUrl as string, fmt, 14, headerY - 4, imgW, imgH);
            } catch (e) {
              console.error('addImage failed with format', fmt, e);
              try { (doc as any).addImage(dataUrl, 14, headerY - 4, imgW, imgH); } catch (er) { console.error('fallback addImage failed', er); }
            }
            headerX = 14 + imgW + 8;
            headerHeight = imgH;
          } catch (e) {
            headerX = 14;
          }
        }
      }

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(String(config.empresaName ?? 'Logs selecionados'), headerX, headerY + 6);
      doc.setFontSize(9);
      if (contact) doc.text(contact, headerX, headerY + 14);
      if (addr) {
        const splitAddr = doc.splitTextToSize(addr, 140);
        doc.text(splitAddr, headerX, headerY + 20);
        headerHeight = Math.max(headerHeight, (splitAddr.length * 6) + 20);
      } else {
        headerHeight = Math.max(headerHeight, 20);
      }

      y += Math.max(headerHeight + 6, 36);
    } else {
      doc.setFontSize(14);
      doc.text('Logs selecionados', 14, y);
      y += 8;
    }
  } catch (e) {
    console.error('GeneratePdf header error', e);
    doc.setFontSize(14);
    doc.text('Logs selecionados', 14, y);
    y += 8;
  }

  doc.setFontSize(11);

  selected.forEach((l: any, idx: number) => {
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
      l.itens.forEach((it: any) => {
        const line = `- ${it.tipo ?? ''}: ${it.descricao ?? ''} (Zona: ${it.zona?.name ?? '-'})`;
        const split = doc.splitTextToSize(line, 180);
        doc.text(split, 16, y);
        y += (split.length * 6);
        if (y > 280) { doc.addPage(); y = 12; }
      });
    }
    y += 6;
    if (y > 280) { doc.addPage(); y = 12; }
  });

  doc.save('logs.pdf');
}

export default generatePdf;
