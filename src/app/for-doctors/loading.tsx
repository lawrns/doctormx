import { Skeleton } from '@/components/ui/skeleton'

export default function ForDoctorsLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Skeleton className="h-12 w-3/4 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-6 w-2/3 mx-auto mb-8 bg-white/20" />
            <Skeleton className="h-12 w-48 mx-auto bg-white/30" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mx-auto mb-12" />
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200">
                <Skeleton className="w-12 h-12 rounded-lg mb-4" />
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
