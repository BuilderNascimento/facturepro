import { ClientForm } from '@/components/clients/ClientForm';

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Nouveau client</h1>
      <ClientForm />
    </div>
  );
}
