export interface InvoicePdfData {
  company: {
    company_name: string;
    legal_status?: string | null;
    siret?: string | null;
    address?: string | null;
    email?: string | null;
    phone?: string | null;
    iban?: string | null;
    bic?: string | null;
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

export function getInvoiceHtml(data: InvoicePdfData): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const c = data.company;
  const cl = data.client;
  const inv = data.invoice;

  const rows = data.items
    .map(
      (i) => `
      <tr>
        <td style="border:1px solid #e2e8f0;padding:10px 12px;text-align:left">${esc(i.description)}</td>
        <td style="border:1px solid #e2e8f0;padding:10px 12px;text-align:center">${Number(i.quantity)}</td>
        <td style="border:1px solid #e2e8f0;padding:10px 12px;text-align:right">${Number(i.unit_price).toFixed(2)} €</td>
        <td style="border:1px solid #e2e8f0;padding:10px 12px;text-align:right;font-weight:600">${(Number(i.quantity) * Number(i.unit_price)).toFixed(2)} €</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Facture ${esc(inv.invoice_number)}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;padding:24px}
    .page{max-width:800px;margin:0 auto;background:#fff;padding:48px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #7c3aed}
    .company-name{font-size:22px;font-weight:700;color:#1e293b;margin-bottom:4px}
    .label{font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
    .invoice-badge{text-align:right}
    .invoice-title{font-size:28px;font-weight:800;color:#7c3aed}
    .invoice-number{font-size:16px;color:#475569;margin-top:4px}
    .parties{display:flex;justify-content:space-between;margin-bottom:32px;gap:32px}
    .party{flex:1}
    .party-name{font-weight:700;font-size:15px;margin-bottom:4px}
    .meta{display:flex;gap:24px;margin-bottom:32px;background:#f8fafc;padding:14px 18px;border-radius:6px;border:1px solid #e2e8f0}
    .meta-item{display:flex;flex-direction:column;gap:2px}
    .meta-label{font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase}
    .meta-value{font-size:13px;font-weight:600;color:#1e293b}
    table{width:100%;border-collapse:collapse;margin-bottom:24px}
    thead tr{background:#f1f5f9}
    thead th{border:1px solid #e2e8f0;padding:10px 12px;font-size:12px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.03em}
    .totals{margin-left:auto;max-width:280px;margin-bottom:32px}
    .total-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#475569}
    .total-final{display:flex;justify-content:space-between;padding:10px 0;font-size:16px;font-weight:700;color:#1e293b;border-top:2px solid #1e293b;margin-top:4px}
    .footer{border-top:1px solid #e2e8f0;padding-top:16px;font-size:12px;color:#64748b;line-height:1.7}
    .print-btn{display:flex;gap:10px;margin-bottom:24px;max-width:800px;margin-left:auto;margin-right:auto}
    .btn{padding:10px 20px;border-radius:6px;border:none;cursor:pointer;font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:6px}
    .btn-primary{background:#7c3aed;color:#fff}
    .btn-secondary{background:#fff;color:#475569;border:1px solid #e2e8f0}
    @media print{
      body{background:#fff;padding:0}
      .page{box-shadow:none;border-radius:0;padding:24px}
      .print-btn{display:none!important}
    }
  </style>
</head>
<body>
  <div class="print-btn">
    <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimer / Enregistrer PDF</button>
    <button class="btn btn-secondary" onclick="window.close()">✕ Fermer</button>
  </div>
  <div class="page">
    <div class="header">
      <div>
        <div class="company-name">${esc(c.company_name)}</div>
        ${c.legal_status ? `<div style="color:#64748b;font-size:13px">${esc(c.legal_status)}</div>` : ''}
        ${c.siret ? `<div style="color:#64748b;font-size:13px">SIRET : ${esc(c.siret)}</div>` : ''}
        ${c.address ? `<div style="color:#64748b;font-size:13px">${esc(c.address)}</div>` : ''}
        ${c.email ? `<div style="color:#64748b;font-size:13px">${esc(c.email)}</div>` : ''}
        ${c.phone ? `<div style="color:#64748b;font-size:13px">${esc(c.phone)}</div>` : ''}
      </div>
      <div class="invoice-badge">
        <div class="invoice-title">FACTURE</div>
        <div class="invoice-number">${esc(inv.invoice_number)}</div>
      </div>
    </div>

    <div class="meta">
      <div class="meta-item">
        <span class="meta-label">Date d'émission</span>
        <span class="meta-value">${fmt(inv.issue_date)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Date d'échéance</span>
        <span class="meta-value">${fmt(inv.due_date)}</span>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <div class="label">Prestataire</div>
        <div class="party-name">${esc(c.company_name)}</div>
        ${c.vat_number ? `<div style="font-size:12px;color:#64748b">N° TVA : ${esc(c.vat_number)}</div>` : ''}
      </div>
      <div class="party" style="text-align:right">
        <div class="label">Client</div>
        <div class="party-name">${esc(cl.company_name)}</div>
        ${cl.contact_name ? `<div style="font-size:13px;color:#475569">${esc(cl.contact_name)}</div>` : ''}
        ${cl.address ? `<div style="font-size:12px;color:#64748b">${esc(cl.address)}</div>` : ''}
        ${cl.email ? `<div style="font-size:12px;color:#64748b">${esc(cl.email)}</div>` : ''}
        ${cl.phone ? `<div style="font-size:12px;color:#64748b">${esc(cl.phone)}</div>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="text-align:left;width:50%">Description</th>
          <th style="text-align:center;width:12%">Qté</th>
          <th style="text-align:right;width:19%">Prix unitaire</th>
          <th style="text-align:right;width:19%">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div class="total-row"><span>Total HT</span><span>${Number(inv.total_ht).toFixed(2)} €</span></div>
      ${Number(inv.total_tva) > 0 ? `<div class="total-row"><span>TVA</span><span>${Number(inv.total_tva).toFixed(2)} €</span></div>` : ''}
      <div class="total-final"><span>Total TTC</span><span>${Number(inv.total_ttc).toFixed(2)} €</span></div>
    </div>

    <div class="footer">
      ${c.legal_text_default ? `<p>${esc(c.legal_text_default)}</p>` : '<p>TVA non applicable, art. 293B du CGI</p>'}
      ${c.iban ? `<p><strong>Coordonnées bancaires :</strong> IBAN : ${esc(c.iban)}${c.bic ? ` · BIC : ${esc(c.bic)}` : ''}</p>` : ''}
      ${c.late_penalty_rate ? `<p>Pénalités de retard : ${Number(c.late_penalty_rate)}% par an.</p>` : ''}
      ${c.indemnity_text_default ? `<p>${esc(c.indemnity_text_default)}</p>` : ''}
      <p style="margin-top:12px;color:#94a3b8;font-size:11px">Document généré par FacturePro</p>
    </div>
  </div>
</body>
</html>`;
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
