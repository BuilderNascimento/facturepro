'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientSchema } from '@/lib/validations/schemas';
import type { Client } from '@/lib/types/database';
import Link from 'next/link';

interface ClientFormProps {
  client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
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
      company_name: formData.get('company_name'),
      contact_name: formData.get('contact_name') || undefined,
      address: formData.get('address') || undefined,
      email: formData.get('email') || undefined,
      phone: formData.get('phone') || undefined,
      siret: formData.get('siret') || undefined,
      vat_number: formData.get('vat_number') || undefined,
      notes: formData.get('notes') || undefined,
    };
    const parsed = clientSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Dados inválidos');
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
      setError(data.error ?? 'Erro no servidor');
      return;
    }
    router.push('/clients');
    router.refresh();
  }

  const field = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome / Empresa do cliente *</label>
          <input name="company_name" defaultValue={client?.company_name ?? ''} required className={field} placeholder="Ex: Dupont Jean" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contacto (mandatário, agência…)</label>
          <input name="contact_name" defaultValue={client?.contact_name ?? ''} className={field} placeholder="Nome do contacto" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
          <input name="phone" defaultValue={client?.phone ?? ''} className={field} placeholder="+33 6 00 00 00 00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input name="email" type="email" defaultValue={client?.email ?? ''} className={field} placeholder="email@exemplo.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">SIRET</label>
          <input name="siret" defaultValue={client?.siret ?? ''} className={field} placeholder="14 dígitos" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
          <textarea name="address" rows={2} defaultValue={client?.address ?? ''} className={field} placeholder="Rua, cidade, código postal" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">N° TVA</label>
          <input name="vat_number" defaultValue={client?.vat_number ?? ''} className={field} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notas internas</label>
          <textarea name="notes" rows={2} defaultValue={client?.notes ?? ''} className={field} placeholder="Informações complementares, observações…" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium">
          {loading ? 'Salvando...' : client ? 'Atualizar' : 'Criar cliente'}
        </button>
        <Link href="/clients" className="px-5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
