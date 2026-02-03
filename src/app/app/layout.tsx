import { cookies } from 'next/headers'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar user={profile} />
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
          <div className="flex items-center gap-4 p-4 lg:hidden bg-white border-b border-gray-200">
            <SidebarTrigger />
            <span className="font-semibold text-gray-900">Doctor.mx</span>
          </div>
          <div className="flex-1 p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
