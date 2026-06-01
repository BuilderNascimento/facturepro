import type { InvoicePdfData } from './invoice-template';
import { getVeryStayPdfColors, parseVeryStayLineItem } from '@/lib/verystay-property-visuals';

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

function getSiren(siret: string | null | undefined): string {
  if (!siret) return '';
  const digits = siret.replace(/\s/g, '');
  return digits.length >= 9 ? digits.slice(0, 9) : digits;
}

function apartmentDisplayName(propertyName: string, isExtra: boolean): string {
  if (!isExtra) return propertyName;
  if (/^extra\s/i.test(propertyName)) return propertyName;
  return `Extra ${propertyName}`;
}

function renderCleaningRow(
  item: { description: string; quantity: number; unit_price: number },
  parsed: ReturnType<typeof parseVeryStayLineItem>
): string {
  const propertyName = parsed.propertyName ?? '—';
  const colors = getVeryStayPdfColors(propertyName, parsed.isExtra);
  const bg = colors?.rowBg ?? '#f9fafb';
  const border = colors?.rowBorder ?? '#d1d5db';
  const text = colors?.text ?? '#111827';
  const emoji = colors?.emoji ?? '';
  const total = Number(item.quantity) * Number(item.unit_price);
  const aptLabel = apartmentDisplayName(propertyName, parsed.isExtra);

  return `
    <tr style="background:${bg};color:${text}">
      <td style="border:1px solid #e5e7eb;padding:8px 10px;text-align:center;font-size:16px;vertical-align:middle;width:52px">${emoji}</td>
      <td style="border:1px solid #e5e7eb;padding:8px 12px;font-weight:600;vertical-align:middle;border-left:4px solid ${border}">${esc(aptLabel)}</td>
      <td style="border:1px solid #e5e7eb;padding:8px 10px;text-align:center;vertical-align:middle">${Number(item.quantity)}</td>
      <td style="border:1px solid #e5e7eb;padding:8px 12px;vertical-align:middle;font-size:12px">${esc(parsed.datesText)}</td>
      <td style="border:1px solid #e5e7eb;padding:8px 12px;text-align:right;vertical-align:middle;white-space:nowrap">${fmtMoney(Number(item.unit_price))}</td>
      <td style="border:1px solid #e5e7eb;padding:8px 12px;text-align:right;vertical-align:middle;font-weight:700;white-space:nowrap">${fmtMoney(total)}</td>
    </tr>`;
}

function renderOtherRow(item: {
  description: string;
  quantity: number;
  unit_price: number;
}): string {
  const total = Number(item.quantity) * Number(item.unit_price);
  return `
    <tr style="background:#f9fafb">
      <td style="border:1px solid #e5e7eb;padding:8px 10px;text-align:center;color:#9ca3af">—</td>
      <td style="border:1px solid #e5e7eb;padding:8px 12px;vertical-align:top" colspan="3">${esc(item.description)}</td>
      <td style="border:1px solid #e5e7eb;padding:8px 12px;text-align:right;vertical-align:top;white-space:nowrap">${fmtMoney(Number(item.unit_price))}</td>
      <td style="border:1px solid #e5e7eb;padding:8px 12px;text-align:right;vertical-align:top;font-weight:600;white-space:nowrap">${fmtMoney(total)}</td>
    </tr>`;
}

export function getVeryStayInvoiceHtml(data: InvoicePdfData): string {
  const c = data.company;
  const cl = data.client;
  const inv = data.invoice;
  const siren = getSiren(c.siret);

  const cleaningRows: string[] = [];
  const otherRows: string[] = [];
  let cleaningSubtotal = 0;

  for (const item of data.items) {
    const parsed = parseVeryStayLineItem(item.description);
    const lineTotal = Number(item.quantity) * Number(item.unit_price);
    if (parsed.isCleaning && parsed.propertyName) {
      cleaningRows.push(renderCleaningRow(item, parsed));
      cleaningSubtotal += lineTotal;
    } else {
      otherRows.push(renderOtherRow(item));
    }
  }

  const legalBar = [
    c.legal_status ? esc(c.legal_status) : null,
    c.siret ? `SIRET : ${esc(c.siret)}` : null,
    siren ? `SIREN : ${siren}` : null,
    c.ape_naf ? `APE/NAF : ${esc(c.ape_naf)}` : null,
    c.vat_number ? `Num TVA : ${esc(c.vat_number)}` : null,
  ]
    .filter(Boolean)
    .join(' — ');

  const defaultIndemnity =
    "En cas de retard de paiement, sera exigible, conformément à l'article L 441-10 du Code de Commerce, une pénalité de retard de 10%, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40€.";
  const indemnityText = c.indemnity_text_default || defaultIndemnity;
  const legalText = c.legal_text_default || 'TVA non applicable, art. 293B du CGI';
  const hasBank = c.iban || c.bic || c.bank_name;
  const invoiceDescription = inv.description ? esc(inv.description) : '';

  const tableHead = `
    <thead>
      <tr style="background:#f1f5f9">
        <th style="border:1px solid #e5e7eb;padding:8px 10px;font-size:11px;width:52px">Code</th>
        <th style="border:1px solid #e5e7eb;padding:8px 12px;font-size:11px;text-align:left">Appartement</th>
        <th style="border:1px solid #e5e7eb;padding:8px 10px;font-size:11px;width:48px">Nb</th>
        <th style="border:1px solid #e5e7eb;padding:8px 12px;font-size:11px;text-align:left">Dates</th>
        <th style="border:1px solid #e5e7eb;padding:8px 12px;font-size:11px;text-align:right;width:90px">Forfait TTC</th>
        <th style="border:1px solid #e5e7eb;padding:8px 12px;font-size:11px;text-align:right;width:90px">Total TTC</th>
      </tr>
    </thead>`;

  const cleaningSection =
    cleaningRows.length > 0
      ? `
    <div style="margin-bottom:16px">
      <div style="background:linear-gradient(90deg,#ede9fe,#fae8ff);border:1px solid #c4b5fd;border-radius:6px 6px 0 0;padding:8px 14px;font-size:12px;font-weight:700;color:#5b21b6;text-transform:uppercase;letter-spacing:.05em">
        Ménage classique + extra ménage
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:6px">
        ${tableHead}
        <tbody>${cleaningRows.join('')}</tbody>
      </table>
      ${
        cleaningSubtotal > 0
          ? `<div style="text-align:right;font-size:13px;font-weight:700;color:#374151;padding:4px 8px">Sous-total ménage : ${fmtMoney(cleaningSubtotal)}</div>`
          : ''
      }
    </div>`
      : '';

  const otherSection =
    otherRows.length > 0
      ? `
    <div style="margin-bottom:16px">
      <div style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px 6px 0 0;padding:8px 14px;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.05em">
        Autres prestations
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        ${tableHead}
        <tbody>${otherRows.join('')}</tbody>
      </table>
    </div>`
      : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Facture ${esc(inv.invoice_number)} — VeryStay</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#111827;background:#f3f4f6;padding:20px}
    .toolbar{display:flex;gap:10px;margin-bottom:16px;max-width:900px;margin-left:auto;margin-right:auto}
    .btn{padding:9px 18px;border-radius:6px;border:none;cursor:pointer;font-size:13px;font-weight:600}
    .btn-print{background:#7c3aed;color:#fff}
    .btn-close{background:#fff;color:#374151;border:1px solid #d1d5db}
    .page{max-width:900px;margin:0 auto 24px;background:#fff;padding:32px 36px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.12)}
    @media print{
      @page{margin:12mm}
      body{background:#fff;padding:0}
      .toolbar,.toolbar-tip{display:none!important}
      .page{box-shadow:none;border-radius:0;padding:20px 24px}
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn btn-print" onclick="window.print()">🖨️ Imprimer / Enregistrer PDF</button>
    <button class="btn btn-close" onclick="window.close()">✕ Fermer</button>
  </div>

  <div class="page">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #7c3aed">
      <div>
        <div style="font-size:18px;font-weight:700">${esc(c.company_name)}</div>
        ${c.legal_status ? `<div style="font-size:12px;color:#4b5563;margin-top:2px">${esc(c.legal_status)}</div>` : ''}
        ${c.address ? `<div style="font-size:12px;color:#4b5563">${esc(c.address)}</div>` : ''}
        ${(c.postal_code || c.city) ? `<div style="font-size:12px;color:#4b5563">${[esc(c.postal_code), esc(c.city)].filter(Boolean).join(' ')}</div>` : ''}
        ${c.phone ? `<div style="font-size:12px;color:#4b5563">Tél. : ${esc(c.phone)}</div>` : ''}
        ${c.email ? `<div style="font-size:12px;color:#4b5563">${esc(c.email)}</div>` : ''}
      </div>
      <div style="text-align:right">
        <div style="font-size:26px;font-weight:800;color:#7c3aed;letter-spacing:.04em">FACTURE</div>
        <table style="margin-left:auto;margin-top:8px;font-size:12px;border-collapse:collapse">
          <tr><td style="color:#6b7280;padding:2px 8px 2px 0;text-align:right">Référence :</td><td style="font-weight:600">${esc(inv.invoice_number)}</td></tr>
          <tr><td style="color:#6b7280;padding:2px 8px 2px 0;text-align:right">Date :</td><td style="font-weight:600">${fmtDate(inv.issue_date)}</td></tr>
        </table>
      </div>
    </div>

    <div style="display:flex;gap:20px;margin-bottom:20px">
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
        <div style="background:#f9fafb;padding:6px 12px;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase">Prestataire</div>
        <div style="padding:10px 12px;font-size:12px;line-height:1.6">${esc(c.company_name)}</div>
      </div>
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
        <div style="background:#f9fafb;padding:6px 12px;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase">Client</div>
        <div style="padding:10px 12px;font-size:12px;line-height:1.6">
          <div style="font-weight:700;font-size:14px">${esc(cl.company_name).toUpperCase()}</div>
          ${cl.contact_name ? `<div>${esc(cl.contact_name)}</div>` : ''}
        </div>
      </div>
    </div>

    ${invoiceDescription ? `<div style="border:1px solid #e5e7eb;border-radius:6px;margin-bottom:18px;padding:10px 14px;font-size:12px;background:#faf5ff"><strong>Référence :</strong> ${invoiceDescription}</div>` : ''}

    <p style="font-size:11px;color:#6b7280;margin-bottom:12px">
      🟩🟪🟧🟨 = ménage classique · 🟢🟣🟠🟡 = ménage extra · Sparissimo (🟩🟧) · Gaite (🟪🟨)
    </p>

    ${cleaningSection}
    ${otherSection}

    <div style="margin-left:auto;max-width:320px;border:2px solid #7c3aed;border-radius:6px;overflow:hidden;margin-top:20px">
      <div style="display:flex;justify-content:space-between;padding:8px 14px;font-size:13px;border-bottom:1px solid #ede9fe">
        <span style="color:#6b7280">Total HT</span><span>${fmtMoney(Number(inv.total_ht))}</span>
      </div>
      ${Number(inv.total_tva) > 0 ? `<div style="display:flex;justify-content:space-between;padding:8px 14px;font-size:13px;border-bottom:1px solid #ede9fe"><span style="color:#6b7280">TVA</span><span>${fmtMoney(Number(inv.total_tva))}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:12px 14px;font-size:16px;font-weight:700;background:#7c3aed;color:#fff">
        <span>TOTAL FACTURE TTC</span><span>${fmtMoney(Number(inv.total_ttc))}</span>
      </div>
    </div>

    <p style="font-size:11px;color:#6b7280;margin-top:16px;line-height:1.5">${esc(legalText)}</p>
    ${legalBar ? `<div style="background:#f1f5f9;border:1px solid #e5e7eb;border-radius:4px;padding:6px 10px;font-size:10px;color:#4b5563;margin-top:8px">${legalBar}</div>` : ''}
    ${indemnityText ? `<p style="font-size:10px;color:#9ca3af;margin-top:8px;line-height:1.5">${esc(indemnityText)}</p>` : ''}

    ${
      hasBank
        ? `<div style="margin-top:20px;border:1px solid #e5e7eb;border-radius:6px;padding:12px 14px;font-size:12px">
      <strong>Paiement</strong> — Virement · Échéance ${fmtDate(inv.due_date)}
      ${c.iban ? `<div>IBAN : ${esc(c.iban)}</div>` : ''}
      ${c.bic ? `<div>BIC : ${esc(c.bic)}</div>` : ''}
    </div>`
        : ''
    }
  </div>
</body>
</html>`;
}
