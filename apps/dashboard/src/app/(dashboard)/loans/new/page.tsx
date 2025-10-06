'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewLoanPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [customers, setCustomers] = useState<any[]>([])
  const [loanProducts, setLoanProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    customer_id: '',
    loan_product_id: '',
    principal_amount: '',
    tenure_months: '',
    repayment_frequency: 'monthly',
    application_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  // Calculated fields
  const [calculatedLoan, setCalculatedLoan] = useState({
    interest_rate: 0,
    total_interest: 0,
    total_amount: 0,
    monthly_installment: 0,
    processing_fee: 0,
  })

  // Load customers and loan products
  useEffect(() => {
    loadData()
  }, [])

  // Calculate loan when product or amount changes
  useEffect(() => {
    if (selectedProduct && formData.principal_amount && formData.tenure_months) {
      calculateLoan()
    }
  }, [selectedProduct, formData.principal_amount, formData.tenure_months])

  const loadData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        supabase.from('customers').select('id, first_name, last_name, customer_code').eq('status', 'active'),
        supabase.from('loan_products').select('*').eq('is_active', true)
      ])

      if (customersRes.data) setCustomers(customersRes.data)
      if (productsRes.data) setLoanProducts(productsRes.data)
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }

  const calculateLoan = () => {
    if (!selectedProduct) return

    const principal = parseFloat(formData.principal_amount)
    const tenureMonths = parseInt(formData.tenure_months)
    const annualRate = selectedProduct.interest_rate

    let totalInterest = 0
    let monthlyInstallment = 0

    if (selectedProduct.interest_calculation === 'declining') {
      // Declining balance method
      const monthlyRate = annualRate / 12 / 100
      monthlyInstallment = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                          (Math.pow(1 + monthlyRate, tenureMonths) - 1)
      const totalAmount = monthlyInstallment * tenureMonths
      totalInterest = totalAmount - principal
    } else if (selectedProduct.interest_calculation === 'flat') {
      // Flat rate method
      totalInterest = (principal * annualRate * tenureMonths) / (12 * 100)
      const totalAmount = principal + totalInterest
      monthlyInstallment = totalAmount / tenureMonths
    } else {
      // Simple interest
      const years = tenureMonths / 12
      totalInterest = (principal * annualRate * years) / 100
      const totalAmount = principal + totalInterest
      monthlyInstallment = totalAmount / tenureMonths
    }

    // Calculate processing fee
    const processingFee = (principal * selectedProduct.processing_fee_percentage / 100) + 
                         (selectedProduct.processing_fee_flat || 0)

    setCalculatedLoan({
      interest_rate: annualRate,
      total_interest: parseFloat(totalInterest.toFixed(2)),
      total_amount: parseFloat((principal + totalInterest).toFixed(2)),
      monthly_installment: parseFloat(monthlyInstallment.toFixed(2)),
      processing_fee: parseFloat(processingFee.toFixed(2)),
    })
  }

  const handleProductChange = (productId: string) => {
    const product = loanProducts.find(p => p.id === productId)
    setSelectedProduct(product)
    setFormData({
      ...formData,
      loan_product_id: productId,
      repayment_frequency: product?.repayment_frequency || 'monthly'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get user's branch
      const { data: profile } = await supabase
        .from('profiles')
        .select('branch_id')
        .eq('id', user.id)
        .single()

      // Calculate maturity date
      const applicationDate = new Date(formData.application_date)
      const maturityDate = new Date(applicationDate)
      maturityDate.setMonth(maturityDate.getMonth() + parseInt(formData.tenure_months))

      // Insert loan
      const { error: insertError } = await supabase
        .from('loans')
        .insert({
          customer_id: formData.customer_id,
          loan_product_id: formData.loan_product_id,
          branch_id: profile?.branch_id,
          loan_officer_id: user.id,
          principal_amount: parseFloat(formData.principal_amount),
          interest_rate: calculatedLoan.interest_rate,
          tenure_months: parseInt(formData.tenure_months),
          repayment_frequency: formData.repayment_frequency,
          total_interest: calculatedLoan.total_interest,
          total_amount: calculatedLoan.total_amount,
          monthly_installment: calculatedLoan.monthly_installment,
          processing_fee: calculatedLoan.processing_fee,
          application_date: formData.application_date,
          maturity_date: maturityDate.toISOString().split('T')[0],
          status: 'pending',
          notes: formData.notes,
          created_by: user.id,
        })

      if (insertError) throw insertError

      router.push('/loans')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create loan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">New Loan Application</h2>
          <p className="text-gray-600 mt-1">Create a new loan for a customer</p>
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

            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name} ({customer.customer_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Loan Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Product <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.loan_product_id}
                onChange={(e) => handleProductChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a loan product</option>
                {loanProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.interest_rate}% {product.interest_calculation})
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <p className="mt-2 text-sm text-gray-600">
                  Amount: ₱{selectedProduct.min_amount.toLocaleString()} - ₱{selectedProduct.max_amount.toLocaleString()} | 
                  Tenure: {selectedProduct.min_tenure_months}-{selectedProduct.max_tenure_months} months
                </p>
              )}
            </div>

            {/* Principal Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount (₱) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={formData.principal_amount}
                onChange={(e) => setFormData({ ...formData, principal_amount: e.target.value })}
                required
                min={selectedProduct?.min_amount || 0}
                max={selectedProduct?.max_amount || 999999}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="0.00"
              />
            </div>

            {/* Tenure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenure (Months) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={formData.tenure_months}
                onChange={(e) => setFormData({ ...formData, tenure_months: e.target.value })}
                required
                min={selectedProduct?.min_tenure_months || 1}
                max={selectedProduct?.max_tenure_months || 60}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="12"
              />
            </div>

            {/* Application Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.application_date}
                onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

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
                disabled={loading || !formData.customer_id || !formData.loan_product_id || !calculatedLoan.total_amount}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Creating...' : 'Create Loan Application'}
              </button>
            </div>
          </form>
        </div>

        {/* Loan Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Summary</h3>
            
            {calculatedLoan.total_amount > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Principal Amount</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₱{parseFloat(formData.principal_amount || '0').toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Interest Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {calculatedLoan.interest_rate}% per annum
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Total Interest</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₱{calculatedLoan.total_interest.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Processing Fee</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₱{calculatedLoan.processing_fee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Tenure</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formData.tenure_months} months
                  </span>
                </div>
                <div className="flex justify-between py-3 bg-gray-50 px-3 rounded-md">
                  <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                  <span className="text-lg font-bold text-red-600">
                    ₱{calculatedLoan.total_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-3 bg-red-50 px-3 rounded-md">
                  <span className="text-sm font-semibold text-gray-900">Monthly Payment</span>
                  <span className="text-lg font-bold text-red-600">
                    ₱{calculatedLoan.monthly_installment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Net Disbursement</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₱{(parseFloat(formData.principal_amount || '0') - calculatedLoan.processing_fee).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                Select a loan product and enter amount to see loan summary
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}