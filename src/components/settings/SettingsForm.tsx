'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { companySettingsSchema, type CompanySettingsInput } from '@/lib/validations/schemas';
import type { CompanySettings } from '@/lib/types/database';

interface SettingsFormProps {
  settings: CompanySettings | null;
}

const F = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm';
const L = 'block text-sm font-medium text-slate-700 mb-1';

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const isIdentityLocked = !!(settings?.siret);

  const defaultValues: CompanySettingsInput = {
    company_name: settings?.company_name ?? '',
    legal_status: settings?.legal_status ?? '',
    siret: settings?.siret ?? '',
    ape_naf: settings?.ape_naf ?? '',
    address: settings?.address ?? '',
    email: settings?.email ?? '',
    phone: settings?.phone ?? '',
    iban: settings?.iban ?? '',
    bic: settings?.bic ?? '',
    bank_name: settings?.bank_name ?? '',
    vat_number: settings?.vat_number ?? '',
    default_payment_terms: settings?.default_payment_terms ?? 30,
    late_penalty_rate: settings?.late_penalty_rate ?? 0,
    legal_text_default: settings?.legal_text_default ?? 'TVA non applicable, art. 293B du CGI',
    indemnity_text_default: settings?.indemnity_text_default ?? 'Indemnité forfaitaire de 40€ pour frais de recouvrement',
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const raw = {
      company_name: formData.get('company_name'),
      legal_status: formData.get('legal_status') || undefined,
      siret: formData.get('siret') || undefined,
      ape_naf: formData.get('ape_naf') || undefined,
      address: formData.get('address') || undefined,
      email: formData.get('email') || undefined,
      phone: formData.get('phone') || undefined,
      iban: formData.get('iban') || undefined,
      bic: formData.get('bic') || undefined,
      bank_name: formData.get('bank_name') || undefined,
      vat_number: formData.get('vat_number') || undefined,
      default_payment_terms: formData.get('default_payment_terms'),
      late_penalty_rate: formData.get('late_penalty_rate'),
      legal_text_default: formData.get('legal_text_default') || undefined,
      indemnity_text_default: formData.get('indemnity_text_default') || undefined,
    };
    const parsed = companySettingsSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Dados inválidos');
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
      setError(data.error ?? 'Erro no servidor');
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</p>}
      {success && <p className="text-green-700 text-sm bg-green-50 rounded-lg p-3">Configurações guardadas com sucesso.</p>}

      {/* Identidade da empresa */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Identidade</h2>
          {isIdentityLocked && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              🔒 Bloqueado
            </span>
          )}
        </div>
        {isIdentityLocked && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            Os dados de identidade da empresa estão bloqueados para garantir a integridade das suas faturas.
            Para solicitar uma alteração, contacte o suporte:{' '}
            <a href="mailto:suporte@factureprobr.xyz" className="font-medium underline">suporte@factureprobr.xyz</a>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className={L}>Nome da empresa *</label>
            <input name="company_name" defaultValue={defaultValues.company_name} required disabled={isIdentityLocked} className={`${F} ${isIdentityLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} placeholder="Ex: Limpezas Silva - EI" />
          </div>
          <div>
            <label className={L}>Forma jurídica</label>
            <input name="legal_status" defaultValue={defaultValues.legal_status} disabled={isIdentityLocked} placeholder="ex. Auto-entrepreneur, SARL" className={`${F} ${isIdentityLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className={L}>SIRET</label>
              <input name="siret" defaultValue={defaultValues.siret} disabled={isIdentityLocked} className={`${F} ${isIdentityLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} placeholder="14 dígitos" />
            </div>
            <div>
              <label className={L}>Código APE / NAF</label>
              <input name="ape_naf" defaultValue={defaultValues.ape_naf} disabled={isIdentityLocked} className={`${F} ${isIdentityLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} placeholder="ex. 8121Z" />
            </div>
            <div>
              <label className={L}>N° TVA intracomunitário</label>
              <input name="vat_number" defaultValue={defaultValues.vat_number} className={F} placeholder="FR 00 XXX XXX XXX" />
            </div>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Contacto</h2>
        <div className="space-y-4">
          <div>
            <label className={L}>Endereço</label>
            <textarea name="address" rows={2} defaultValue={defaultValues.address} className={F} placeholder="Rua, código postal, cidade, país" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={L}>Email</label>
              <input name="email" type="email" defaultValue={defaultValues.email} className={F} placeholder="contato@minhaempresa.fr" />
            </div>
            <div>
              <label className={L}>Telefone</label>
              <input name="phone" defaultValue={defaultValues.phone} className={F} placeholder="+33 6 00 00 00 00" />
            </div>
          </div>
        </div>
      </div>

      {/* Dados bancários */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Dados bancários</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={L}>Nome do banco</label>
            <input name="bank_name" defaultValue={defaultValues.bank_name} className={F} placeholder="ex. Wise, BNP…" />
          </div>
          <div>
            <label className={L}>IBAN</label>
            <input name="iban" defaultValue={defaultValues.iban} className={F} placeholder="FR76 XXXX XXXX XXXX" />
          </div>
          <div>
            <label className={L}>BIC / SWIFT</label>
            <input name="bic" defaultValue={defaultValues.bic} className={F} placeholder="TRWIFRP1XXX" />
          </div>
        </div>
      </div>

      {/* Condições de pagamento */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Condições de pagamento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={L}>Prazo de pagamento (dias)</label>
            <input name="default_payment_terms" type="number" min="0" defaultValue={defaultValues.default_payment_terms} className={F} />
          </div>
          <div>
            <label className={L}>Juros de mora (%)</label>
            <input name="late_penalty_rate" type="number" step="0.01" min="0" max="100" defaultValue={defaultValues.late_penalty_rate} className={F} />
          </div>
        </div>
      </div>

      {/* Menções legais (saem em francês na fatura) */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Menções legais <span className="text-xs font-normal text-slate-400">(aparecem em francês na fatura)</span></h2>
        <div className="space-y-4">
          <div>
            <label className={L}>Menção TVA</label>
            <textarea name="legal_text_default" rows={2} defaultValue={defaultValues.legal_text_default} className={F} />
          </div>
          <div>
            <label className={L}>Cláusula de cobrança</label>
            <textarea name="indemnity_text_default" rows={3} defaultValue={defaultValues.indemnity_text_default} className={F} />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={loading} className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium text-sm">
          {loading ? 'Salvando...' : 'Guardar configurações'}
        </button>
      </div>
    </form>
  );
}
