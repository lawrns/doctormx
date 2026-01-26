import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AIConsultaClient } from './ai-consulta-client';

export default async function AIConsultaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/app/ai-consulta');
  }

  return <AIConsultaClient userId={user.id} />;
}
