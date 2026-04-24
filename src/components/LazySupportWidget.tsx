'use client'

import dynamic from 'next/dynamic'

const SupportWidget = dynamic(
  () => import('@/components/SupportWidget').then((mod) => mod.SupportWidget),
  { ssr: false }
)

export function LazySupportWidget() {
  return <SupportWidget />
}
