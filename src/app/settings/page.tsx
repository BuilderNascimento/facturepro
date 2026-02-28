import { IS_DEMO, demoSettings } from '@/lib/demo/data';
import { SettingsForm } from '@/components/settings/SettingsForm';
import type { CompanySettings } from '@/lib/types/database';

async function getSettings(): Promise<CompanySettings | null> {
  if (IS_DEMO) return demoSettings;
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('company_settings').select('*').limit(1).maybeSingle();
  return (data as CompanySettings | null) ?? null;
}

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Configurações da empresa</h1>
      <p className="text-slate-600">
        Estas informações aparecerão nas suas faturas.
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}
