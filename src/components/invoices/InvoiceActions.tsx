'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileDown, Mail, Loader2, Printer } from 'lucide-react';

interface InvoiceActionsProps {
  invoiceId: string;
  invoiceNumber: string;
  clientEmail: string | null;
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
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  function handleOpenPdf() {
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  }

  async function handleSendEmail() {
    if (!clientEmail) {
      alert('Aucune adresse email pour ce client.');
      return;
    }
    setSendingEmail(true);
    setEmailMsg(null);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: clientEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      setEmailMsg('Email envoyé ✓');
      router.refresh();
    } catch (e) {
      setEmailMsg(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {emailMsg && (
        <span className={`text-sm ${emailMsg.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
          {emailMsg}
        </span>
      )}
      <button
        type="button"
        onClick={handleOpenPdf}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition"
      >
        <Printer className="w-4 h-4" />
        Imprimer / PDF
      </button>
      <button
        type="button"
        onClick={handleSendEmail}
        disabled={sendingEmail || !clientEmail}
        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-sm transition"
      >
        {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
        Envoyer par email
      </button>
    </div>
  );
}
