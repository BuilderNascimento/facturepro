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
  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const company = data.company;
  const client = data.client;
  const inv = data.invoice;

  const rows = data.items
    .map(
      (i) => `
    <tr>
      <td class="border border-slate-300 px-3 py-2 text-left">${escapeHtml(i.description)}</td>
      <td class="border border-slate-300 px-3 py-2 text-right">${Number(i.quantity)}</td>
      <td class="border border-slate-300 px-3 py-2 text-right">${Number(i.unit_price).toFixed(2)} €</td>
      <td class="border border-slate-300 px-3 py-2 text-right">${Number(i.total).toFixed(2)} €</td>
    </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Facture ${escapeHtml(inv.invoice_number)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, sans-serif; }
    .text-small { font-size: 0.875rem; }
  </style>
</head>
<body class="p-8 text-slate-800">
  <div class="flex justify-between items-start mb-8">
    <div>
      <h1 class="text-2xl font-bold">${escapeHtml(company.company_name)}</h1>
      ${company.legal_status ? `<p class="text-small text-slate-600">${escapeHtml(company.legal_status)}</p>` : ''}
      ${company.siret ? `<p class="text-small text-slate-600">SIRET : ${escapeHtml(company.siret)}</p>` : ''}
      ${company.address ? `<p class="text-small text-slate-600">${escapeHtml(company.address)}</p>` : ''}
      ${company.email ? `<p class="text-small text-slate-600">${escapeHtml(company.email)}</p>` : ''}
      ${company.phone ? `<p class="text-small text-slate-600">${escapeHtml(company.phone)}</p>` : ''}
      ${company.vat_number ? `<p class="text-small text-slate-600">N° TVA : ${escapeHtml(company.vat_number)}</p>` : ''}
    </div>
    <div class="text-right">
      <p class="text-xl font-bold text-primary-600">FACTURE</p>
      <p class="text-lg font-semibold mt-1">${escapeHtml(inv.invoice_number)}</p>
    </div>
  </div>

  <div class="flex justify-between gap-8 mb-8">
    <div>
      <p class="text-sm font-medium text-slate-500 uppercase mb-2">Client</p>
      <p class="font-semibold">${escapeHtml(client.company_name)}</p>
      ${client.contact_name ? `<p class="text-small">${escapeHtml(client.contact_name)}</p>` : ''}
      ${client.address ? `<p class="text-small text-slate-600">${escapeHtml(client.address)}</p>` : ''}
      ${client.email ? `<p class="text-small text-slate-600">${escapeHtml(client.email)}</p>` : ''}
      ${client.phone ? `<p class="text-small text-slate-600">${escapeHtml(client.phone)}</p>` : ''}
      ${client.siret ? `<p class="text-small text-slate-600">SIRET : ${escapeHtml(client.siret)}</p>` : ''}
      ${client.vat_number ? `<p class="text-small text-slate-600">N° TVA : ${escapeHtml(client.vat_number)}</p>` : ''}
    </div>
    <div class="text-right text-small">
      <p><strong>Date d’émission :</strong> ${formatDate(inv.issue_date)}</p>
      <p><strong>Date d’échéance :</strong> ${formatDate(inv.due_date)}</p>
    </div>
  </div>

  <table class="w-full border-collapse mb-6">
    <thead>
      <tr class="bg-slate-100">
        <th class="border border-slate-300 px-3 py-2 text-left font-medium">Description</th>
        <th class="border border-slate-300 px-3 py-2 text-right font-medium">Quantité</th>
        <th class="border border-slate-300 px-3 py-2 text-right font-medium">Prix unitaire</th>
        <th class="border border-slate-300 px-3 py-2 text-right font-medium">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="max-w-xs ml-auto mb-6 text-small">
    <div class="flex justify-between py-1"><span>Total HT</span><span>${Number(inv.total_ht).toFixed(2)} €</span></div>
    ${Number(inv.total_tva) > 0 ? `<div class="flex justify-between py-1"><span>TVA</span><span>${Number(inv.total_tva).toFixed(2)} €</span></div>` : ''}
    <div class="flex justify-between py-2 font-bold text-base border-t border-slate-300 mt-2 pt-2"><span>Total TTC</span><span>${Number(inv.total_ttc).toFixed(2)} €</span></div>
  </div>

  ${company.legal_text_default ? `<p class="text-small text-slate-600 mb-2">${escapeHtml(company.legal_text_default)}</p>` : ''}
  ${company.iban || company.bic ? `<p class="text-small text-slate-600 mb-2"><strong>Coordonnées bancaires :</strong> IBAN : ${escapeHtml(company.iban || '—')} · BIC : ${escapeHtml(company.bic || '—')}</p>` : ''}
  ${company.late_penalty_rate ? `<p class="text-small text-slate-600 mb-2">En cas de retard de paiement, des pénalités de ${Number(company.late_penalty_rate)}% seront appliquées.</p>` : ''}
  ${company.indemnity_text_default ? `<p class="text-small text-slate-600">${escapeHtml(company.indemnity_text_default)}</p>` : ''}

  <p class="text-small text-slate-500 mt-8">Document généré par FacturePro</p>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
