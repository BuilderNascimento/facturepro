import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export async function createClient() {
  if (IS_DEMO) {
    // Retorna um cliente seguro (sem operações reais) em modo demo
    const noop = async () => ({ data: null, error: null });
    return {
      from: () => ({
        select: () => ({ order: () => ({ data: [], error: null }), data: [], error: null, maybeSingle: noop, single: noop, is: () => ({ order: () => ({ data: [], error: null }), maybeSingle: noop }) }),
        insert: () => noop(),
        update: () => ({ eq: () => noop() }),
        delete: () => ({ eq: () => noop() }),
        upsert: () => noop(),
      }),
      auth: {
        getUser: async () => ({ data: { user: { id: 'demo', email: 'demo@facturepro.fr' } }, error: null }),
        signOut: async () => ({ error: null }),
      },
      storage: {
        from: () => ({
          upload: async () => ({ error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
      rpc: async () => ({ data: null, error: null }),
    } as unknown as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorar em Server Components de leitura
          }
        },
      },
    }
  );
}
