import { AppLayout } from '@/components/layout/AppLayout';
import { IS_DEMO, demoSettings } from '@/lib/demo/data';

async function getLayoutData() {
  if (IS_DEMO) return { email: 'demo@facturepro.fr', companyName: demoSettings.company_name };
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: settings } = await supabase.from('company_settings').select('company_name').limit(1).maybeSingle();
  return { email: user?.email ?? null, companyName: settings?.company_name ?? null };
}

export default async function ServicesLayout({ children }: { children: React.ReactNode }) {
  const { email, companyName } = await getLayoutData();
  return <AppLayout userEmail={email} companyName={companyName}>{children}</AppLayout>;
}
