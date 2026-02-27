import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ServiceForm } from '@/components/services/ServiceForm';

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: service } = await supabase.from('services').select('*').eq('id', id).single();
  if (!service) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Modifier le service</h1>
      <ServiceForm service={service} />
    </div>
  );
}
