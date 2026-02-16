import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-neutral-900 hover:text-primary-600 transition-colors">
            Doctor.mx
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Volver al Inicio
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                {i < 3 && <Skeleton className="w-16 h-1" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <Skeleton className="h-12 w-full rounded-lg mt-4" />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-neutral-200 sticky top-8">
              <Skeleton className="h-6 w-40 mb-6" />
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between pt-3 border-t border-neutral-200">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Option */}
        <div className="mt-6 text-center">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar y volver al panel
          </Link>
        </div>
      </div>
    </div>
  )
}
