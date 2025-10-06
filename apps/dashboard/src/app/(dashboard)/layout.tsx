import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Debt<span className="text-red-600">Note</span>
            </h1>
            <nav className="hidden md:flex space-x-6">
              <a href="/dashboard" className="text-gray-700 hover:text-red-600 font-medium">
                Dashboard
              </a>
              <a href="/customers" className="text-gray-700 hover:text-red-600 font-medium">
                Customers
              </a>
              <a href="/loans" className="text-gray-700 hover:text-red-600 font-medium">
                Loans
              </a>
              <a href="/payments" className="text-gray-700 hover:text-red-600 font-medium">
                Payments
              </a>
              <a href="/reports" className="text-gray-700 hover:text-red-600 font-medium">
                Reports
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
