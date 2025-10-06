import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get summary stats
  const [
    { count: totalCustomers },
    { count: activeLoans },
    { count: pendingLoans },
    { data: recentPayments }
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('payments').select('*, customer:customers(first_name, last_name)').order('created_at', { ascending: false }).limit(5)
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome to DebtNote Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCustomers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeLoans || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Loans</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingLoans || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collection Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">95%</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
        </div>
        <div className="p-6">
          {recentPayments && recentPayments.length > 0 ? (
            <div className="space-y-4">
              {recentPayments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.customer?.first_name} {payment.customer?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{payment.receipt_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₱{payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent payments</p>
          )}
        </div>
      </div>
    </div>
  )
}
