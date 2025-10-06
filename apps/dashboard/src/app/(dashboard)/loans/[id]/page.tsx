import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function LoanDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Get loan details
  const { data: loan, error } = await supabase
    .from('loans')
    .select(`
      *,
      customer:customers(
        id,
        customer_code,
        first_name,
        last_name,
        phone,
        email,
        address_line1,
        city,
        province
      ),
      loan_product:loan_products(name, code, interest_calculation),
      branch:branches(name),
      loan_officer:profiles!loans_loan_officer_id_fkey(full_name),
      approved_by_profile:profiles!loans_approved_by_fkey(full_name)
    `)
    .eq('id', params.id)
    .single()

  if (error || !loan) {
    notFound()
  }

  // Get loan schedule
  const { data: schedules } = await supabase
    .from('loan_schedules')
    .select('*')
    .eq('loan_id', params.id)
    .order('installment_number', { ascending: true })

  // Get payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*, collected_by:profiles(full_name)')
    .eq('loan_id', params.id)
    .order('payment_date', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold text-gray-900">{loan.loan_number}</h2>
            <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
              loan.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : loan.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : loan.status === 'approved'
                ? 'bg-blue-100 text-blue-800'
                : loan.status === 'fully_paid'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {loan.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600 mt-1">{loan.loan_product?.name}</p>
        </div>
        <Link
          href="/dashboard/loans"
          className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
        >
          ← Back to Loans
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Principal Amount</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₱{Number(loan.principal_amount).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₱{Number(loan.total_amount).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            ₱{Number(loan.total_paid).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            ₱{Number(loan.outstanding_balance).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {loan.customer?.first_name} {loan.customer?.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer Code</p>
                <p className="text-sm font-medium text-gray-900">{loan.customer?.customer_code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-sm font-medium text-gray-900">{loan.customer?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm font-medium text-gray-900">{loan.customer?.email || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-sm font-medium text-gray-900">
                  {loan.customer?.address_line1}, {loan.customer?.city}, {loan.customer?.province}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href={`/customers/${loan.customer?.id}`}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                View Customer Profile →
              </Link>
            </div>
          </div>

          {/* Loan Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Loan Product</p>
                <p className="text-sm font-medium text-gray-900">{loan.loan_product?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Interest Rate</p>
                <p className="text-sm font-medium text-gray-900">
                  {loan.interest_rate}% ({loan.loan_product?.interest_calculation})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tenure</p>
                <p className="text-sm font-medium text-gray-900">{loan.tenure_months} months</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Installment</p>
                <p className="text-sm font-medium text-gray-900">
                  ₱{Number(loan.monthly_installment).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Application Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(loan.application_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Maturity Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {loan.maturity_date ? new Date(loan.maturity_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Branch</p>
                <p className="text-sm font-medium text-gray-900">{loan.branch?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Loan Officer</p>
                <p className="text-sm font-medium text-gray-900">{loan.loan_officer?.full_name}</p>
              </div>
              {loan.approved_by && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Approved By</p>
                    <p className="text-sm font-medium text-gray-900">{loan.approved_by_profile?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Approval Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {loan.approval_date ? new Date(loan.approval_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </>
              )}
            </div>
            {loan.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-sm text-gray-900 mt-1">{loan.notes}</p>
              </div>
            )}
          </div>

          {/* Payment Schedule */}
          {schedules && schedules.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Payment Schedule</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {schedules.map((schedule: any) => (
                      <tr key={schedule.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{schedule.installment_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(schedule.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ₱{Number(schedule.total_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ₱{Number(schedule.paid_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            schedule.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : schedule.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : schedule.status === 'partial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {schedule.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment History */}
          {payments && payments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
              </div>
              <div className="p-6 space-y-4">
                {payments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{payment.receipt_number}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.payment_date).toLocaleDateString()} • 
                        {payment.payment_method} • 
                        Collected by {payment.collected_by?.full_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₱{Number(payment.amount).toLocaleString()}</p>
                      <span className={`text-xs font-medium ${
                        payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            
            {loan.status === 'pending' && (
              <>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                  Approve Loan
                </button>
                <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                  Reject Loan
                </button>
              </>
            )}

            {loan.status === 'approved' && (
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Disburse Loan
              </button>
            )}

            {loan.status === 'active' && (
              <>
                <Link
                  href={`/payments/new?loan_id=${loan.id}`}
                  className="block w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-center"
                >
                  Record Payment
                </Link>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                  Generate Schedule
                </button>
              </>
            )}

            <hr className="my-4" />

            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              Print Loan Agreement
            </button>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              Download Schedule (PDF)
            </button>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              Send SMS Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}