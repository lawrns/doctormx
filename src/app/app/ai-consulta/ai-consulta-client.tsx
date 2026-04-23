'use client'

import { DrSimeonProtocolChat } from '@/components/ai-consulta/DrSimeonProtocolChat'

export function AIConsultaClient({ userId }: { userId: string }) {
  return <DrSimeonProtocolChat anonymous={false} userId={userId} />
}
