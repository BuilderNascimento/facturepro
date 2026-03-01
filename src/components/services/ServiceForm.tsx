'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { serviceSchema, type ServiceInput } from '@/lib/validations/schemas';
import type { Service } from '@/lib/types/database';
import Link from 'next/link';

interface ServiceFormProps {
  service?: Service;
}

const unitOptions = [
  { value: 'hora', label: 'Hora' },
  { value: 'serviço', label: 'Serviço' },
  { value: 'pacote', label: 'Pacote' },
  { value: 'mensal', label: 'Mensal' },
];

export function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultValues: ServiceInput = {
    name: service?.name ?? '',
    description: service?.description ?? '',
    unit_price: service?.unit_price ?? 0,
    unit_type: service?.unit_type ?? 'hora',
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const raw = {
      name: formData.get('name'),
      description: formData.get('description') || undefined,
      unit_price: formData.get('unit_price'),
      unit_type: formData.get('unit_type'),
    };
    const parsed = serviceSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Dados inválidos');
      setLoading(false);
      return;
    }
    const res = await fetch(service ? `/api/services/${service.id}` : '/api/services', {
      method: service ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Erro no servidor');
      return;
    }
    router.push('/services');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
        <input id="name" name="name" defaultValue={defaultValues.name} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea id="description" name="description" rows={2} defaultValue={defaultValues.description} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="unit_price" className="block text-sm font-medium text-slate-700 mb-1">Preço unitário (€) *</label>
          <input id="unit_price" name="unit_price" type="number" step="0.01" min="0" defaultValue={defaultValues.unit_price} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label htmlFor="unit_type" className="block text-sm font-medium text-slate-700 mb-1">Unidade *</label>
          <select id="unit_type" name="unit_type" defaultValue={defaultValues.unit_type} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500">
            {unitOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {loading ? 'Salvando...' : service ? 'Atualizar' : 'Criar'}
        </button>
        <Link href="/services" className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancelar</Link>
      </div>
    </form>
  );
}
