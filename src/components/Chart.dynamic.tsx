'use client'

import dynamic from 'next/dynamic'

// Dynamic import for Chart component to avoid loading recharts on initial page load
const DynamicChart = dynamic(() => import('./Chart').then(mod => ({ default: mod.Chart })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
      <span className="text-gray-400">Cargando gráfica...</span>
    </div>
  ),
})

const DynamicMiniSparkline = dynamic(() => import('./Chart').then(mod => ({ default: mod.MiniSparkline })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[40px] bg-gray-100 rounded animate-pulse" />
  ),
})

export { DynamicChart, DynamicMiniSparkline }
export default DynamicChart
