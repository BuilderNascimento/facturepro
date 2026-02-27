'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { propertySchema } from '@/lib/validations/schemas';
import type { Property, Client } from '@/lib/types/database';
import Link from 'next/link';

interface PropertyFormProps {
  property?: Property;
  clients: Pick<Client, 'id' | 'company_name' | 'contact_name'>[];
}

export function PropertyForm({ property, clients }: PropertyFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const raw = {
      client_id: formData.get('client_id'),
      name: formData.get('name'),
      address: formData.get('address') || undefined,
      normal_price: formData.get('normal_price'),
      extra_price: formData.get('extra_price'),
      notes: formData.get('notes') || undefined,
    };
    const parsed = propertySchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Données invalides');
      setLoading(false);
      return;
    }
    const res = await fetch(property ? `/api/properties/${property.id}` : '/api/properties', {
      method: property ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Erreur serveur');
      return;
    }
    router.push('/properties');
    router.refresh();
  }

  const field = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Propriétaire *</label>
          {clients.length === 0 ? (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              Aucun client trouvé.{' '}
              <Link href="/clients/new" className="underline font-medium">Créer un client d'abord</Link>.
            </p>
          ) : (
            <select name="client_id" defaultValue={property?.client_id ?? ''} required className={field}>
              <option value="">Sélectionner le propriétaire</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}{c.contact_name ? ` — ${c.contact_name}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'appartement *</label>
          <input name="name" defaultValue={property?.name ?? ''} required className={field} placeholder="Ex: Appt 3B Rue Victor Hugo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Adresse de l'appartement</label>
          <input name="address" defaultValue={property?.address ?? ''} className={field} placeholder="Rue, ville, code postal" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Prix nettoyage normal (€) *
          </label>
          <div className="relative">
            <input
              name="normal_price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={property?.normal_price ?? ''}
              required
              className={`${field} pr-8`}
              placeholder="0.00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">€</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Prix nettoyage extra (€)
          </label>
          <div className="relative">
            <input
              name="extra_price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={property?.extra_price ?? 0}
              className={`${field} pr-8`}
              placeholder="0.00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">€</span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea name="notes" rows={2} defaultValue={property?.notes ?? ''} className={field} placeholder="Informations d'accès, notes diverses…" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading || clients.length === 0} className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium">
          {loading ? 'Enregistrement...' : property ? 'Mettre à jour' : 'Créer l\'appartement'}
        </button>
        <Link href="/properties" className="px-5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm">
          Annuler
        </Link>
      </div>
    </form>
  );
}
