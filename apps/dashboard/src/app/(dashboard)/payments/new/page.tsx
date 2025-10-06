'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loans, setLoans] = useState<any[]>([])
  const [selectedLoan, setSelectedLoan] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    loan_id: searchParams.get('loan_id') || '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: 'cash',
    payment_reference: '',
    notes: '',
  })

  // Load active loans
  useEffect(() => {
    loadLoans()
  }, [])

  // Load selected loan details
  useEffect(() => {
    if (formData.loan_id) {
      loadLoanDetails(formData.loan_id)
    }
  }, [formData.loan_id])

  const loadLoans = async () => {
    try {
      const { data } = await supabase
        .from('loans')
        .select(`
          id,
          loan_number,
          outstanding_balance,
          customer:customers(first_name, last_name, customer_code)
        `)
        .in('status', ['active', 'disbursed'])
        .order('loan_number', { ascending: true })

      if (data) setLoans(data)
    } catch (err) {
      console.error('Error loading loans:', err)
    }
  }

  const loadLoanDetails = async (loanId: string) => {
    try {
      const { data } = await supabase
        .from('loans')
        .select(`
          *,
          customer:customers(first_name, last_name, customer_code, phone),
          loan_schedules(*)
        `)
        .eq('id', loanId)
        .single()

      if (data) {
        setSelectedLoan(data)
        // Auto-fill amount with outstanding balance
        if (!formData.amount) {
          setFormData(prev => ({ 
            ...prev, 
            amount: data.outstanding_balance?.toString() || '' 
          }))
        }
      }
    } catch (err) {
      console.error('Error loading loan details:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const paymentAmount = parseFloat(formData.amount)

      // Simple payment allocation (principal first, then interest)
      const principalPaid = Math.min(
        paymentAmount,
        selectedLoan.principal_amount - selectedLoan.principal_paid
      )
      const interestPaid = Math.min(
        paymentAmount - principalPaid,
        selectedLoan.total_interest - selectedLoan.interest_paid
      )

      // Insert payment
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          loan_id: formData.loan_id,
          customer_id: selectedLoan.customer_id,
          payment_date: formData.payment_date,
          amount: paymentAmount,
          principal_paid: principalPaid,
          interest_paid: interestPaid,
          payment_method: formData.payment_method,
          payment_reference: formData.payment_reference || null,
          collected_by: user.id,
          status: 'completed',
          notes: formData.notes || null,
        })

      if (insertError) throw insertError

      router.push('/payments')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Record Payment</h2>
          <p className="text-gray-600 mt-1">Record a new loan payment</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md">
                {error}
              </div>
            )}

            {/* Loan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Loan <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.loan_id}
                onChange={(e) => setFormData({ ...formData, loan_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Choose a loan...</option>
                {loans.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    {loan.loan_number} - {loan.customer?.first_name} {loan.customer?.last_name} 
                    (Balance: ₱{Number(loan.outstanding_balance).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Payment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount (₱) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                step="0.01"
                min="0.01"
                max={selectedLoan?.outstanding_balance || 999999999}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="0.00"
              />
              {selectedLoan && (
                <p className="mt-2 text-sm text-gray-600">
                  Outstanding Balance: ₱{Number(selectedLoan.outstanding_balance).toLocaleString()}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="gcash">GCash</option>
                <option value="paymaya">PayMaya</option>
                <option value="check">Check</option>
                <option value="online">Online</option>
              </select>
            </div>

            {/* Payment Reference */}
            {formData.payment_method !== 'cash' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Number / Transaction ID
                </label>
                <input
                  type="text"
                  value={formData.payment_reference}
                  onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter reference number"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Any additional notes..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.loan_id || !formData.amount}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>

        {/* Loan Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Summary</h3>
            
            {selectedLoan ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedLoan.customer?.first_name} {selectedLoan.customer?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{selectedLoan.customer?.phone}</p>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Loan Number</span>
                  <span className="text-sm font-medium text-gray-900">{selectedLoan.loan_number}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Principal</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₱{Number(selectedLoan.principal_amount).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₱{Number(selectedLoan.total_amount).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Total Paid</span>
                  <span className="text-sm font-medium text-green-600">
                    ₱{Number(selectedLoan.total_paid).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-3 bg-red-50 px-3 rounded-md">
                  <span className="text-sm font-semibold text-gray-900">Outstanding Balance</span>
                  <span className="text-lg font-bold text-red-600">
                    ₱{Number(selectedLoan.outstanding_balance).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Principal Paid</span>
                  <span className="text-sm text-gray-900">
                    ₱{Number(selectedLoan.principal_paid).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Interest Paid</span>
                  <span className="text-sm text-gray-900">
                    ₱{Number(selectedLoan.interest_paid).toLocaleString()}
                  </span>
                </div>

                {formData.amount && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">After this payment:</p>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">New Balance</span>
                      <span className="text-sm font-bold text-green-600">
                        ₱{(Number(selectedLoan.outstanding_balance) - Number(formData.amount)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                Select a loan to view details
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}