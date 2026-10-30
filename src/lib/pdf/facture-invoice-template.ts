import type { InvoicePdfData } from './invoice-template';
import { getObservationsHtml, getPaymentConditionsHtml } from './payment-conditions';
import {
  durationLabel,
  formatDateFr,
  formatHoursDisplay,
  parseFactureLine,
  type FactureKind,
  type ParsedFactureLine,
} from '@/lib/facture-lines';

function esc(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function fmtDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return d;
  }
}

function fmtMoney(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

type Row = {
  parsed: ParsedFactureLine;
  amount: number;
};

const SECTION_META: Record<
  FactureKind,
  { title: string; headerBg: string; headerColor: string }
> = {
  Ménage: {
    title: '1. NETTOYAGE / MÉNAGE',
    headerBg: '#1e4a7a',
    headerColor: '#fff',
  },
  Accueil: {
    title: '2. ACCUEIL / CHECK-IN',
    headerBg: '#1e4a7a',
    headerColor: '#fff',
  },
  'Pick-up': {
    title: '3. PICK-UP / RÉCOLTE – DÉPÔT',
    headerBg: '#1e4a7a',
    headerColor: '#fff',
  },
};

function renderSection(kind: FactureKind, rows: Row[]): string {
  if (!rows.length) return '';
  const meta = SECTION_META[kind];
  let subtotal = 0;
  const body = rows
    .map((r, idx) => {
      subtotal += r.amount;
      const bg = idx % 2 === 0 ? '#ffffff' : '#f3f4f6';
      const heure = formatHoursDisplay(r.parsed.startTime, r.parsed.endTime);
      const duree = durationLabel(r.parsed.startTime, r.parsed.endTime);
      const heureCell = duree ? `${esc(heure)}<div style="font-size:10px;color:#6b7280">${esc(duree)}</div>` : esc(heure);
      return `
      <tr style="background:${bg}">
        <td style="border:1px solid #e5e7eb;padding:8px 10px;white-space:nowrap">${esc(formatDateFr(r.parsed.date))}</td>
        <td style="border:1px solid #e5e7eb;padding:8px 10px;white-space:nowrap">${heureCell}</td>
        <td style="border:1px solid #e5e7eb;padding:8px 10px;font-weight:600">${esc(r.parsed.kind)}</td>
        <td style="border:1px solid #e5e7eb;padding:8px 10px">${esc(r.parsed.local || '—')}</td>
        <td style="border:1px solid #e5e7eb;padding:8px 10px;text-align:right;font-weight:600;white-space:nowrap">${fmtMoney(r.amount)}</td>
      </tr>`;
    })
    .join('');

  return `
    <div style="margin-bottom:18px">
      <div style="background:${meta.headerBg};color:${meta.headerColor};padding:8px 12px;font-size:12px;font-weight:700;letter-spacing:.04em;border-radius:4px 4px 0 0">
        ${esc(meta.title)}
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#e8eef5">
            <th style="border:1px solid #e5e7eb;padding:8px 10px;text-align:left;width:14%">Date</th>
            <th style="border:1px solid #e5e7eb;padding:8px 10px;text-align:left;width:16%">Heure</th>
            <th style="border:1px solid #e5e7eb;padding:8px 10px;text-align:left;width:16%">Nom</th>
            <th style="border:1px solid #e5e7eb;padding:8px 10px;text-align:left">Local</th>
            <th style="border:1px solid #e5e7eb;padding:8px 10px;text-align:right;width:16%">Montant</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
      <div style="text-align:right;padding:8px 12px;font-size:13px;font-weight:700;background:#f8fafc;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 4px 4px">
        Sous-total ${esc(kind)} : ${fmtMoney(subtotal)}
      </div>
    </div>`;
}

export function getFactureInvoiceHtml(data: InvoicePdfData): string {
  const c = data.company;
  const cl = data.client;
  const inv = data.invoice;

  const issueYear = (() => {
    try {
      const y = new Date(inv.issue_date).getFullYear();
      return Number.isFinite(y) ? y : new Date().getFullYear();
    } catch {
      return new Date().getFullYear();
    }
  })();

  const byKind: Record<FactureKind, Row[]> = {
    Ménage: [],
    Accueil: [],
    'Pick-up': [],
  };
  const otherRows: { description: string; amount: number }[] = [];

  for (const item of data.items) {
    const parsed = parseFactureLine(item.description, issueYear);
    const amount = Number(item.quantity) * Number(item.unit_price);
    if (parsed) {
      byKind[parsed.kind].push({ parsed, amount });
    } else {
      otherRows.push({ description: item.description, amount });
    }
  }

  const sections = (['Ménage', 'Accueil', 'Pick-up'] as FactureKind[])
    .map((k) => renderSection(k, byKind[k]))
    .join('');

  const others =
    otherRows.length > 0
      ? `
    <div style="margin-bottom:16px">
      <div style="background:#64748b;color:#fff;padding:8px 12px;font-size:12px;font-weight:700;border-radius:4px 4px 0 0">Autres</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        ${otherRows
          .map(
            (o) => `
          <tr>
            <td style="border:1px solid #e5e7eb;padding:8px 10px">${esc(o.description)}</td>
            <td style="border:1px solid #e5e7eb;padding:8px 10px;text-align:right;font-weight:600;white-space:nowrap">${fmtMoney(o.amount)}</td>
          </tr>`
          )
          .join('')}
      </table>
    </div>`
      : '';

  const hasBank = !!(c.iban || c.bic || c.bank_name);
  const bankBlock = hasBank
    ? `
    <div style="margin-top:18px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
      <div style="background:#1e4a7a;color:#fff;padding:6px 12px;font-size:10px;font-weight:700;letter-spacing:.08em">INFORMATIONS BANCAIRES</div>
      <div style="padding:12px 14px;font-size:12px;line-height:1.7">
        ${c.bank_name ? `<div><span style="color:#6b7280">Banque</span> — <strong>${esc(c.bank_name)}</strong></div>` : ''}
        ${c.iban ? `<div><span style="color:#6b7280">IBAN</span> — <strong>${esc(c.iban)}</strong></div>` : ''}
        ${c.bic ? `<div><span style="color:#6b7280">BIC</span> — <strong>${esc(c.bic)}</strong></div>` : ''}
        <div style="margin-top:4px;color:#6b7280;font-size:11px">Virement · Échéance ${fmtDate(inv.due_date)}</div>
      </div>
    </div>`
    : '';

  const observations = inv.description ? getObservationsHtml(inv.description) : '';
  const paymentConditions = getPaymentConditionsHtml();

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Facture ${esc(inv.invoice_number)}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#111827;background:#f3f4f6;padding:20px}
    .toolbar{display:flex;gap:10px;margin-bottom:16px;max-width:920px;margin-left:auto;margin-right:auto}
    .btn{padding:9px 18px;border-radius:6px;border:none;cursor:pointer;font-size:13px;font-weight:600}
    .btn-print{background:#1e4a7a;color:#fff}
    .btn-close{background:#fff;color:#374151;border:1px solid #d1d5db}
    .page{max-width:920px;margin:0 auto;background:#fff;padding:32px 36px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.12)}
    @media print{
      @page{margin:12mm}
      body{background:#fff;padding:0}
      .toolbar{display:none!important}
      .page{box-shadow:none;border-radius:0;padding:16px 20px}
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn btn-print" onclick="window.print()">Imprimer / Enregistrer PDF</button>
    <button class="btn btn-close" onclick="window.close()">Fermer</button>
  </div>

  <div class="page">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px;padding-bottom:14px;border-bottom:2px solid #1e4a7a">
      <div style="font-size:28px;font-weight:800;color:#1e4a7a;letter-spacing:.06em">FACTURE</div>
      <div style="text-align:right;font-size:13px">
        <div><span style="color:#6b7280">N°</span> <strong>${esc(inv.invoice_number)}</strong></div>
        <div style="margin-top:4px"><span style="color:#6b7280">Date</span> <strong>${fmtDate(inv.issue_date)}</strong></div>
      </div>
    </div>

    <div style="display:flex;gap:20px;margin-bottom:22px">
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
        <div style="background:#1e4a7a;color:#fff;padding:6px 12px;font-size:10px;font-weight:700;letter-spacing:.08em">PRESTATAIRE</div>
        <div style="padding:10px 12px;font-size:12px;line-height:1.65">
          <div style="font-weight:700;font-size:14px">${esc(c.company_name)}</div>
          ${c.legal_status ? `<div>${esc(c.legal_status)}</div>` : ''}
          ${c.address ? `<div>${esc(c.address)}</div>` : ''}
          ${(c.postal_code || c.city) ? `<div>${[esc(c.postal_code), esc(c.city)].filter(Boolean).join(' ')}</div>` : ''}
          ${c.siret ? `<div>SIRET : ${esc(c.siret)}</div>` : ''}
          ${c.email ? `<div>${esc(c.email)}</div>` : ''}
          ${c.phone ? `<div>Tél. : ${esc(c.phone)}</div>` : ''}
        </div>
      </div>
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
        <div style="background:#1e4a7a;color:#fff;padding:6px 12px;font-size:10px;font-weight:700;letter-spacing:.08em">CLIENT</div>
        <div style="padding:10px 12px;font-size:12px;line-height:1.65">
          <div style="font-weight:700;font-size:14px">${esc(cl.company_name).toUpperCase()}</div>
          ${cl.contact_name ? `<div>${esc(cl.contact_name)}</div>` : ''}
          ${cl.address ? `<div>${esc(cl.address)}</div>` : ''}
          ${cl.email ? `<div>${esc(cl.email)}</div>` : ''}
          ${cl.phone ? `<div>${esc(cl.phone)}</div>` : ''}
        </div>
      </div>
    </div>

    ${sections}
    ${others}

    <div style="margin-left:auto;max-width:300px;margin-top:8px;border:2px solid #1e4a7a;border-radius:6px;overflow:hidden">
      <div style="display:flex;justify-content:space-between;padding:8px 14px;font-size:13px;border-bottom:1px solid #e5e7eb">
        <span style="color:#6b7280">Total HT</span><span>${fmtMoney(Number(inv.total_ht))}</span>
      </div>
      ${Number(inv.total_tva) > 0 ? `<div style="display:flex;justify-content:space-between;padding:8px 14px;font-size:13px;border-bottom:1px solid #e5e7eb"><span style="color:#6b7280">TVA</span><span>${fmtMoney(Number(inv.total_tva))}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:12px 14px;font-size:16px;font-weight:700;background:#1e4a7a;color:#fff">
        <span>TOTAL TTC</span><span>${fmtMoney(Number(inv.total_ttc))}</span>
      </div>
    </div>

    ${bankBlock}
    ${observations}
    ${paymentConditions}
  </div>
</body>
</html>`;
}
