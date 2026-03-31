export interface InvoicePdfData {
  company: {
    company_name: string;
    legal_status?: string | null;
    siret?: string | null;
    ape_naf?: string | null;
    address?: string | null;
    city?: string | null;
    postal_code?: string | null;
    email?: string | null;
    phone?: string | null;
    iban?: string | null;
    bic?: string | null;
    bank_name?: string | null;
    vat_number?: string | null;
    legal_text_default?: string | null;
    indemnity_text_default?: string | null;
    late_penalty_rate?: number | null;
  };
  client: {
    company_name: string;
    contact_name?: string | null;
    address?: string | null;
    email?: string | null;
    phone?: string | null;
    siret?: string | null;
    vat_number?: string | null;
  };
  invoice: {
    invoice_number: string;
    issue_date: string;
    due_date: string;
    status: string;
    total_ht: number;
    total_tva: number;
    total_ttc: number;
  };
  items: { description: string; quantity: number; unit_price: number; total: number }[];
}

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
  } catch { return d; }
}

function fmtMoney(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

/** Derives SIREN (first 9 digits) from a SIRET string */
function getSiren(siret: string | null | undefined): string {
  if (!siret) return '';
  const digits = siret.replace(/\s/g, '');
  return digits.length >= 9 ? digits.slice(0, 9) : digits;
}

/** Formats a description for display: if it contains ' — ' with comma-separated dates, show each date on its own line */
function formatDescription(desc: string): string {
  // Pattern: "Nettoyage standard — 01 jan., 07 jan., 15 jan."
  const match = desc.match(/^(.+?)\s*—\s*(.+)$/);
  if (match) {
    const label = esc(match[1].trim());
    const dates = match[2].split(',').map((d) => `<div style="padding-left:12px;color:#374151;font-size:12px">${esc(d.trim())}</div>`).join('');
    return `<div style="font-weight:600">${label}</div>${dates}`;
  }
  return esc(desc);
}

export function getInvoiceHtml(data: InvoicePdfData): string {
  const c = data.company;
  const cl = data.client;
  const inv = data.invoice;

  const siren = getSiren(c.siret);

  // Legal footer bar content
  const legalBar = [
    c.legal_status ? esc(c.legal_status) : null,
    c.siret ? `SIRET : ${esc(c.siret)}` : null,
    siren ? `SIREN : ${siren}` : null,
    c.ape_naf ? `APE/NAF : ${esc(c.ape_naf)}` : null,
    c.vat_number ? `Num TVA : ${esc(c.vat_number)}` : null,
  ].filter(Boolean).join(' — ');

  // Table rows
  const rows = data.items
    .map(
      (i) => `
      <tr>
        <td style="border:1px solid #e5e7eb;padding:10px 12px;text-align:left;vertical-align:top">${formatDescription(i.description)}</td>
        <td style="border:1px solid #e5e7eb;padding:10px 12px;text-align:right;vertical-align:top;white-space:nowrap">${fmtMoney(Number(i.unit_price))}</td>
        <td style="border:1px solid #e5e7eb;padding:10px 12px;text-align:center;vertical-align:top">${Number(i.quantity)}</td>
        <td style="border:1px solid #e5e7eb;padding:10px 12px;text-align:center;vertical-align:top;color:#6b7280">u</td>
        <td style="border:1px solid #e5e7eb;padding:10px 12px;text-align:right;vertical-align:top;font-weight:600;white-space:nowrap">${fmtMoney(Number(i.quantity) * Number(i.unit_price))}</td>
      </tr>`
    )
    .join('');

  const defaultIndemnity = 'En cas de retard de paiement, sera exigible, conformément à l\'article L 441-10 du Code de Commerce, une pénalité de retard de 10%, ainsi qu\'une indemnité forfaitaire pour frais de recouvrement de 40€.';
  const indemnityText = c.indemnity_text_default || defaultIndemnity;
  const legalText = c.legal_text_default || 'TVA non applicable, art. 293B du CGI';
  const hasBank = c.iban || c.bic || c.bank_name;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Facture ${esc(inv.invoice_number)}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#111827;background:#f3f4f6;padding:20px}
    .toolbar{display:flex;gap:10px;margin-bottom:16px;max-width:860px;margin-left:auto;margin-right:auto}
    .btn{padding:9px 18px;border-radius:6px;border:none;cursor:pointer;font-size:13px;font-weight:600}
    .btn-print{background:#1d4ed8;color:#fff}
    .btn-close{background:#fff;color:#374151;border:1px solid #d1d5db}
    .page{max-width:860px;margin:0 auto 24px;background:#fff;padding:32px 36px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.12)}
    /* Header */
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #1d4ed8}
    .hdr-company{flex:1}
    .hdr-company .name{font-size:18px;font-weight:700;color:#111827;margin-bottom:3px}
    .hdr-company .line{font-size:12px;color:#4b5563;line-height:1.6}
    .hdr-badge{text-align:right;min-width:220px}
    .hdr-badge .title{font-size:28px;font-weight:800;color:#1d4ed8;letter-spacing:.04em;margin-bottom:8px}
    .ref-table{margin-left:auto;border-collapse:collapse;font-size:12px}
    .ref-table td{padding:2px 4px;color:#374151}
    .ref-table td:first-child{color:#6b7280;text-align:right;padding-right:8px;white-space:nowrap}
    .ref-table td:last-child{font-weight:600;text-align:left}
    /* Parties */
    .parties{display:flex;gap:24px;margin-bottom:24px}
    .party{flex:1;border:1px solid #e5e7eb;border-radius:4px;overflow:hidden}
    .party-head{background:#f9fafb;border-bottom:1px solid #e5e7eb;padding:6px 12px;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.08em}
    .party-body{padding:10px 12px;font-size:12px;line-height:1.7;color:#374151}
    .party-body .pname{font-size:14px;font-weight:700;color:#111827;margin-bottom:2px}
    /* Table */
    .items-table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px}
    .items-table thead tr{background:#f1f5f9}
    .items-table thead th{border:1px solid #e5e7eb;padding:8px 12px;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.04em}
    /* Totals */
    .totals{margin-left:auto;max-width:300px;margin-bottom:24px;border:1px solid #e5e7eb;border-radius:4px;overflow:hidden}
    .total-row{display:flex;justify-content:space-between;padding:7px 14px;font-size:13px;border-bottom:1px solid #f1f5f9}
    .total-row span:first-child{color:#6b7280}
    .total-final{display:flex;justify-content:space-between;padding:10px 14px;font-size:15px;font-weight:700;background:#1d4ed8;color:#fff}
    /* Footer */
    .footer-bar{background:#f1f5f9;border:1px solid #e5e7eb;border-radius:3px;padding:6px 10px;font-size:10.5px;color:#4b5563;margin-bottom:8px;line-height:1.5}
    .legal-text{font-size:10.5px;color:#6b7280;line-height:1.6;margin-bottom:8px}
    .page-num{font-size:10px;color:#9ca3af;text-align:right}
    /* Page 2 */
    .p2-section{margin-bottom:24px;border:1px solid #e5e7eb;border-radius:4px;overflow:hidden}
    .p2-head{background:#f9fafb;border-bottom:1px solid #e5e7eb;padding:8px 14px;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.06em}
    .p2-body{padding:12px 14px;font-size:13px;line-height:1.8;color:#374151}
    .p2-body .kv{display:flex;gap:8px}
    .p2-body .kv span:first-child{color:#6b7280;min-width:160px}
    .net-payer{display:flex;justify-content:space-between;align-items:center;background:#1d4ed8;color:#fff;padding:12px 14px;border-radius:4px;margin-top:16px;font-size:16px;font-weight:700}
    @media print{
      @page{margin:12mm}
      body{background:#fff;padding:0}
      .toolbar,.toolbar-tip{display:none!important}
      .page{box-shadow:none;border-radius:0;padding:20px 24px;margin-bottom:0}
      .page-break{page-break-before:always}
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn btn-print" onclick="window.print()">🖨️ Imprimer / Enregistrer PDF</button>
    <button class="btn btn-close" onclick="window.close()">✕ Fermer</button>
  </div>
  <p class="toolbar-tip" style="max-width:860px;margin:0 auto 8px;font-size:11px;color:#6b7280">Pour ne pas afficher l’URL sur le PDF imprimé : avant d’imprimer, désactivez « En-têtes et pieds de page » dans les options d’impression.</p>

  <!-- ═══ PAGE 1 ═══ -->
  <div class="page">

    <!-- En-tête -->
    <div class="hdr">
      <div class="hdr-company">
        <div class="name">${esc(c.company_name)}</div>
        ${c.legal_status ? `<div class="line">${esc(c.legal_status)}</div>` : ''}
        ${c.address ? `<div class="line">${esc(c.address)}</div>` : ''}
        ${(c.postal_code || c.city) ? `<div class="line">${[esc(c.postal_code), esc(c.city)].filter(Boolean).join(' ')}</div>` : ''}
        ${c.phone ? `<div class="line">Tél. : ${esc(c.phone)}</div>` : ''}
        ${c.email ? `<div class="line">${esc(c.email)}</div>` : ''}
      </div>
      <div class="hdr-badge">
        <div class="title">FACTURE</div>
        <table class="ref-table">
          <tr><td>Référence :</td><td>${esc(inv.invoice_number)}</td></tr>
          <tr><td>Version :</td><td>1.0</td></tr>
          <tr><td>Date de facturation :</td><td>${fmtDate(inv.issue_date)}</td></tr>
        </table>
      </div>
    </div>

    <!-- Prestataire / Client -->
    <div class="parties">
      <div class="party">
        <div class="party-head">Prestataire</div>
        <div class="party-body">
          <div class="pname">${esc(c.company_name)}</div>
          ${c.legal_status ? `<div>${esc(c.legal_status)}</div>` : ''}
          ${c.siret ? `<div>SIRET : ${esc(c.siret)}</div>` : ''}
          ${c.address ? `<div>${esc(c.address)}</div>` : ''}
          ${(c.postal_code || c.city) ? `<div>${[esc(c.postal_code), esc(c.city)].filter(Boolean).join(' ')}</div>` : ''}
          ${c.phone ? `<div>Tél. : ${esc(c.phone)}</div>` : ''}
          ${c.email ? `<div>${esc(c.email)}</div>` : ''}
        </div>
      </div>
      <div class="party">
        <div class="party-head">Client</div>
        <div class="party-body">
          <div class="pname">${esc(cl.company_name).toUpperCase()}</div>
          ${cl.contact_name ? `<div>${esc(cl.contact_name)}</div>` : ''}
          ${cl.address ? `<div>${esc(cl.address)}</div>` : ''}
          ${cl.phone ? `<div>${esc(cl.phone)}</div>` : ''}
          ${cl.email ? `<div>${esc(cl.email)}</div>` : ''}
        </div>
      </div>
    </div>

    <!-- Tableau des prestations -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="text-align:left;width:46%">Description</th>
          <th style="text-align:right;width:16%">Prix Unit. HT</th>
          <th style="text-align:center;width:10%">Quantité</th>
          <th style="text-align:center;width:8%">Unité</th>
          <th style="text-align:right;width:20%">Total HT</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <!-- Totaux -->
    <div class="totals">
      <div class="total-row"><span>Total HT</span><span>${fmtMoney(Number(inv.total_ht))}</span></div>
      ${Number(inv.total_tva) > 0 ? `<div class="total-row"><span>TVA</span><span>${fmtMoney(Number(inv.total_tva))}</span></div>` : ''}
      <div class="total-final"><span>Total TTC</span><span>${fmtMoney(Number(inv.total_ttc))}</span></div>
    </div>

    <!-- Barre légale -->
    ${legalBar ? `<div class="footer-bar">${legalBar}</div>` : ''}
    <div class="legal-text">
      ${indemnityText ? `<p>${esc(indemnityText)}</p>` : ''}
      <p>Aucun escompte ne sera accordé en cas de paiement anticipé.</p>
      ${legalText ? `<p>${esc(legalText)}</p>` : ''}
    </div>
    <div class="page-num">${esc(inv.invoice_number)} · 1 sur 2</div>
  </div>

  <!-- ═══ PAGE 2 — Récapitulatif paiement ═══ -->
  <div class="page-break"></div>
  <div class="page">

    ${hasBank ? `
    <div class="p2-section">
      <div class="p2-head">Informations Bancaires</div>
      <div class="p2-body">
        ${c.bank_name ? `<div class="kv"><span>Banque</span><span>${esc(c.bank_name)}</span></div>` : ''}
        ${c.iban ? `<div class="kv"><span>IBAN</span><span>${esc(c.iban)}</span></div>` : ''}
        ${c.bic ? `<div class="kv"><span>BIC</span><span>${esc(c.bic)}</span></div>` : ''}
      </div>
    </div>` : ''}

    <div class="p2-section">
      <div class="p2-head">Récapitulatif</div>
      <div class="p2-body">
        <div class="kv"><span>Total HT</span><span>${fmtMoney(Number(inv.total_ht))}</span></div>
        ${Number(inv.total_tva) > 0 ? `<div class="kv"><span>TVA</span><span>${fmtMoney(Number(inv.total_tva))}</span></div>` : ''}
        <div class="kv"><span>Total Net TTC</span><span>${fmtMoney(Number(inv.total_ttc))}</span></div>
      </div>
    </div>

    <div class="p2-section">
      <div class="p2-head">Conditions de règlement</div>
      <div class="p2-body">
        <div class="kv"><span>Prestation de service</span><span></span></div>
        <div class="kv"><span>Date d'échéance</span><span>${fmtDate(inv.due_date)}</span></div>
        <div class="kv"><span>Mode de paiement</span><span>Virement</span></div>
      </div>
    </div>

    <div class="net-payer">
      <span>Net à payer</span>
      <span>${fmtMoney(Number(inv.total_ttc))}</span>
    </div>

    <br/>
    ${legalBar ? `<div class="footer-bar">${legalBar}</div>` : ''}
    <div class="legal-text">
      ${indemnityText ? `<p>${esc(indemnityText)}</p>` : ''}
      <p>Aucun escompte ne sera accordé en cas de paiement anticipé.</p>
      ${legalText ? `<p>${esc(legalText)}</p>` : ''}
    </div>
    <div class="page-num">${esc(inv.invoice_number)} · 2 sur 2</div>
  </div>
</body>
</html>`;
}
