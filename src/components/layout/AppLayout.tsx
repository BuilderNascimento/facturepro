import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

interface AppLayoutProps {
  children: React.ReactNode;
  userEmail?: string | null;
  companyName?: string | null;
}

export function AppLayout({ children, userEmail, companyName }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader userEmail={userEmail} companyName={companyName} />
        <main className="flex-1 overflow-auto p-6 md:p-8 bg-slate-50/50">{children}</main>
      </div>
    </div>
  );
}
