import { notFound } from 'next/navigation';
import { ServiceForm } from '@/components/services/ServiceForm';
import { IS_DEMO } from '@/lib/demo/data';
import type { Service } from '@/lib/types/database';

async function getService(id: string): Promise<Service | null> {
  if (IS_DEMO) {
    const { storeGetService } = await import('@/lib/demo/store');
    return storeGetService(id);
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('services').select('*').eq('id', id).single();
  return (data as Service | null) ?? null;
}

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Modifier le service</h1>
      <ServiceForm service={service} />
    </div>
  );
}
