'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientSchema, type ClientInput } from '@/lib/validations/schemas';
import type { Client } from '@/lib/types/database';
import Link from 'next/link';

interface ClientFormProps {
  client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultValues: ClientInput = {
    company_name: client?.company_name ?? '',
    contact_name: client?.contact_name ?? '',
    address: client?.address ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    siret: client?.siret ?? '',
    vat_number: client?.vat_number ?? '',
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const raw = {
      company_name: formData.get('company_name'),
      contact_name: formData.get('contact_name') || undefined,
      address: formData.get('address') || undefined,
      email: formData.get('email'),
      phone: formData.get('phone') || undefined,
      siret: formData.get('siret') || undefined,
      vat_number: formData.get('vat_number') || undefined,
    };
    const parsed = clientSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Données invalides');
      setLoading(false);
      return;
    }
    const res = await fetch(client ? `/api/clients/${client.id}` : '/api/clients', {
      method: client ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Erreur serveur');
      return;
    }
    router.push('/clients');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-slate-700 mb-1">Nom de l’entreprise *</label>
        <input id="company_name" name="company_name" defaultValue={defaultValues.company_name} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <label htmlFor="contact_name" className="block text-sm font-medium text-slate-700 mb-1">Nom du contact</label>
        <input id="contact_name" name="contact_name" defaultValue={defaultValues.contact_name} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
        <textarea id="address" name="address" rows={2} defaultValue={defaultValues.address} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
        <input id="email" name="email" type="email" defaultValue={defaultValues.email} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
        <input id="phone" name="phone" defaultValue={defaultValues.phone} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
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
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {loading ? 'Enregistrement...' : client ? 'Mettre à jour' : 'Créer'}
        </button>
        <Link href="/clients" className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
          Annuler
        </Link>
      </div>
    </form>
  );
}
