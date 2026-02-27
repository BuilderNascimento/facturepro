'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Mail, Loader2 } from 'lucide-react';

interface InvoiceActionsProps {
  invoiceId: string;
  invoiceNumber: string;
  clientEmail: string;
  hasPdf: boolean;
  status: string;
}

export function InvoiceActions({
  invoiceId,
  invoiceNumber,
  clientEmail,
  hasPdf,
  status,
}: InvoiceActionsProps) {
  const router = useRouter();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  async function handleGeneratePdf() {
    setGeneratingPdf(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      if (data.url) window.open(data.url, '_blank');
      router.refresh();
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function handleSendEmail() {
    if (!clientEmail) {
      alert('Aucune adresse email pour ce client.');
      return;
    }
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: clientEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      alert('Email envoyé avec succès.');
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur d’envoi');
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleGeneratePdf}
        disabled={generatingPdf}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
      >
        {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {hasPdf ? 'Télécharger PDF' : 'Générer PDF'}
      </button>
      <button
        type="button"
        onClick={handleSendEmail}
        disabled={sendingEmail || !clientEmail}
        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-sm"
      >
        {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
        Envoyer par email
      </button>
    </div>
  );
}
