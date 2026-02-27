'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { companySettingsSchema, type CompanySettingsInput } from '@/lib/validations/schemas';
import type { CompanySettings } from '@/lib/types/database';

interface SettingsFormProps {
  settings: CompanySettings | null;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultValues: CompanySettingsInput = {
    company_name: settings?.company_name ?? '',
    legal_status: settings?.legal_status ?? '',
    siret: settings?.siret ?? '',
    address: settings?.address ?? '',
    email: settings?.email ?? '',
    phone: settings?.phone ?? '',
    iban: settings?.iban ?? '',
    bic: settings?.bic ?? '',
    vat_number: settings?.vat_number ?? '',
    default_payment_terms: settings?.default_payment_terms ?? 30,
    late_penalty_rate: settings?.late_penalty_rate ?? 0,
    legal_text_default: settings?.legal_text_default ?? 'TVA non applicable, art. 293B du CGI',
    indemnity_text_default: settings?.indemnity_text_default ?? 'Indemnité forfaitaire de 40€ pour frais de recouvrement',
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const raw = {
      company_name: formData.get('company_name'),
      legal_status: formData.get('legal_status') || undefined,
      siret: formData.get('siret') || undefined,
      address: formData.get('address') || undefined,
      email: formData.get('email') || undefined,
      phone: formData.get('phone') || undefined,
      iban: formData.get('iban') || undefined,
      bic: formData.get('bic') || undefined,
      vat_number: formData.get('vat_number') || undefined,
      default_payment_terms: formData.get('default_payment_terms'),
      late_penalty_rate: formData.get('late_penalty_rate'),
      legal_text_default: formData.get('legal_text_default') || undefined,
      indemnity_text_default: formData.get('indemnity_text_default') || undefined,
    };
    const parsed = companySettingsSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Données invalides');
      setLoading(false);
      return;
    }
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Erreur serveur');
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-slate-700 mb-1">Raison sociale *</label>
        <input id="company_name" name="company_name" defaultValue={defaultValues.company_name} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <label htmlFor="legal_status" className="block text-sm font-medium text-slate-700 mb-1">Forme juridique</label>
        <input id="legal_status" name="legal_status" defaultValue={defaultValues.legal_status} placeholder="ex. Auto-entrepreneur, SARL" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="siret" className="block text-sm font-medium text-slate-700 mb-1">SIRET</label>
          <input id="siret" name="siret" defaultValue={defaultValues.siret} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label htmlFor="vat_number" className="block text-sm font-medium text-slate-700 mb-1">N° TVA</label>
          <input id="vat_number" name="vat_number" defaultValue={defaultValues.vat_number} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
        <textarea id="address" name="address" rows={2} defaultValue={defaultValues.address} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input id="email" name="email" type="email" defaultValue={defaultValues.email} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
          <input id="phone" name="phone" defaultValue={defaultValues.phone} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="iban" className="block text-sm font-medium text-slate-700 mb-1">IBAN</label>
          <input id="iban" name="iban" defaultValue={defaultValues.iban} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label htmlFor="bic" className="block text-sm font-medium text-slate-700 mb-1">BIC</label>
          <input id="bic" name="bic" defaultValue={defaultValues.bic} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="default_payment_terms" className="block text-sm font-medium text-slate-700 mb-1">Délai de paiement (jours)</label>
          <input id="default_payment_terms" name="default_payment_terms" type="number" min="0" defaultValue={defaultValues.default_payment_terms} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label htmlFor="late_penalty_rate" className="block text-sm font-medium text-slate-700 mb-1">Pénalités de retard (%)</label>
          <input id="late_penalty_rate" name="late_penalty_rate" type="number" step="0.01" min="0" max="100" defaultValue={defaultValues.late_penalty_rate} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>
      <div>
        <label htmlFor="legal_text_default" className="block text-sm font-medium text-slate-700 mb-1">Mention légale TVA</label>
        <textarea id="legal_text_default" name="legal_text_default" rows={2} defaultValue={defaultValues.legal_text_default} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <label htmlFor="indemnity_text_default" className="block text-sm font-medium text-slate-700 mb-1">Indemnité forfaitaire recouvrement</label>
        <textarea id="indemnity_text_default" name="indemnity_text_default" rows={2} defaultValue={defaultValues.indemnity_text_default} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>
      <div className="pt-4">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
