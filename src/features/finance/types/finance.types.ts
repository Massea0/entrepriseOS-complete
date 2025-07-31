import { ReactNode } from 'react'
import { User } from '@/features/auth/types/auth.types'

// Currency and money types
export type Currency = 
  | 'EUR' | 'USD' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'SEK' | 'NOK'

export interface Money {
  amount: number
  currency: Currency
}

export interface ExchangeRate {
  from: Currency
  to: Currency
  rate: number
  date: Date
}

// Document status types
export type InvoiceStatus = 
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'refunded'

export type QuoteStatus = 
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted'

export type ExpenseStatus = 
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'reimbursed'

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'disputed'

// Payment method types
export type PaymentMethod = 
  | 'bank_transfer'
  | 'credit_card'
  | 'debit_card'
  | 'paypal'
  | 'stripe'
  | 'cash'
  | 'check'
  | 'crypto'

// Tax types
export interface TaxRate {
  id: string
  name: string
  rate: number // percentage
  country: string
  region?: string
  isDefault: boolean
  isActive: boolean
  validFrom: Date
  validTo?: Date
}

export interface TaxLine {
  taxRate: TaxRate
  taxableAmount: Money
  taxAmount: Money
}

// Contact entities (customers/suppliers)
export interface Contact {
  id: string
  type: 'customer' | 'supplier' | 'both'
  
  // Basic info
  name: string
  email: string
  phone?: string
  website?: string
  
  // Company details
  companyName?: string
  vatNumber?: string
  taxNumber?: string
  registrationNumber?: string
  
  // Address
  billingAddress: Address
  shippingAddress?: Address
  
  // Financial settings
  defaultCurrency: Currency
  defaultPaymentTerms: number // days
  defaultPaymentMethod?: PaymentMethod
  creditLimit?: Money
  
  // Relationship
  customerSince?: Date
  supplierSince?: Date
  contactPerson?: string
  accountManager?: Pick<User, 'id' | 'firstName' | 'lastName'>
  
  // Status and tags
  isActive: boolean
  tags: string[]
  notes?: string
  
  // System
  createdAt: Date
  updatedAt: Date
}

// Address structure
export interface Address {
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault?: boolean
}

// Product and service entities
export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  category?: ProductCategory
  
  // Pricing
  unitPrice: Money
  costPrice?: Money
  
  // Inventory
  trackInventory: boolean
  currentStock?: number
  minimumStock?: number
  
  // Tax and accounting
  defaultTaxRate?: TaxRate
  incomeAccount?: Account
  expenseAccount?: Account
  
  // Status
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductCategory {
  id: string
  name: string
  description?: string
  parentId?: string
  isActive: boolean
}

// Line item for invoices, quotes, etc.
export interface LineItem {
  id: string
  product?: Product
  description: string
  quantity: number
  unitPrice: Money
  discountPercent?: number
  discountAmount?: Money
  taxLines: TaxLine[]
  totalAmount: Money
  notes?: string
}

// Invoice entity
export interface Invoice {
  id: string
  number: string
  status: InvoiceStatus
  
  // Parties
  contact: Contact
  billingAddress: Address
  shippingAddress?: Address
  
  // Dates
  issueDate: Date
  dueDate: Date
  paidDate?: Date
  
  // Financial details
  currency: Currency
  exchangeRate?: number
  lineItems: LineItem[]
  subtotal: Money
  totalTax: Money
  totalDiscount: Money
  totalAmount: Money
  paidAmount: Money
  remainingAmount: Money
  
  // Payment terms
  paymentTerms: number // days
  lateFee?: Money
  earlyPaymentDiscount?: {
    percentage: number
    days: number
  }
  
  // References
  poNumber?: string // Purchase Order
  quoteId?: string
  projectId?: string
  
  // Documents
  attachments: FileAttachment[]
  pdfUrl?: string
  
  // Communication
  sentAt?: Date
  viewedAt?: Date
  lastReminderSent?: Date
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
  notes?: string
}

// Quote/Estimate entity
export interface Quote {
  id: string
  number: string
  status: QuoteStatus
  
  // Parties
  contact: Contact
  billingAddress: Address
  shippingAddress?: Address
  
  // Dates
  issueDate: Date
  validUntil: Date
  convertedAt?: Date
  
  // Financial details
  currency: Currency
  exchangeRate?: number
  lineItems: LineItem[]
  subtotal: Money
  totalTax: Money
  totalDiscount: Money
  totalAmount: Money
  
  // Terms and conditions
  paymentTerms: number
  deliveryTerms?: string
  validityPeriod: number // days
  
  // References
  rfqNumber?: string // Request for Quote
  projectId?: string
  
  // Conversion
  convertedToInvoiceId?: string
  
  // Documents
  attachments: FileAttachment[]
  pdfUrl?: string
  
  // Communication
  sentAt?: Date
  viewedAt?: Date
  acceptedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
  notes?: string
}

// Expense entity
export interface Expense {
  id: string
  number: string
  status: ExpenseStatus
  
  // Basic details
  description: string
  category: ExpenseCategory
  supplier?: Contact
  
  // Financial
  amount: Money
  taxAmount?: Money
  totalAmount: Money
  
  // Dates
  expenseDate: Date
  submittedAt?: Date
  approvedAt?: Date
  paidAt?: Date
  
  // Approval workflow
  submittedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  approver?: Pick<User, 'id' | 'firstName' | 'lastName'>
  approvalNotes?: string
  
  // Accounting
  account?: Account
  project?: string
  department?: string
  
  // Documents
  receipt?: FileAttachment
  attachments: FileAttachment[]
  
  // Reimbursement
  isReimbursable: boolean
  reimbursedAt?: Date
  reimbursementAmount?: Money
  
  // System
  createdAt: Date
  updatedAt: Date
  notes?: string
}

export interface ExpenseCategory {
  id: string
  name: string
  description?: string
  defaultAccount?: Account
  requiresReceipt: boolean
  maxAmount?: Money
  isActive: boolean
}

// Payment entity
export interface Payment {
  id: string
  reference: string
  status: PaymentStatus
  type: 'incoming' | 'outgoing'
  
  // Financial details
  amount: Money
  fees?: Money
  netAmount: Money
  
  // Method and details
  method: PaymentMethod
  methodDetails?: PaymentMethodDetails
  
  // Parties
  from?: Contact
  to?: Contact
  
  // References
  invoiceId?: string
  expenseId?: string
  
  // Dates
  paymentDate: Date
  processedAt?: Date
  settledAt?: Date
  
  // External references
  transactionId?: string
  gatewayResponse?: any
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
  notes?: string
}

export interface PaymentMethodDetails {
  // Bank transfer
  bankName?: string
  accountNumber?: string
  routingNumber?: string
  iban?: string
  bic?: string
  
  // Card details (masked)
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  
  // Digital payments
  paypalEmail?: string
  stripePaymentIntentId?: string
  
  // Check
  checkNumber?: string
  
  // Crypto
  walletAddress?: string
  transactionHash?: string
  cryptocurrency?: string
}

// Accounting entities
export interface Account {
  id: string
  code: string
  name: string
  type: AccountType
  parentId?: string
  
  // Balance and status
  currentBalance: Money
  isActive: boolean
  
  // Configuration
  allowDirectPosting: boolean
  requiresProject: boolean
  requiresDepartment: boolean
  
  // System
  createdAt: Date
  updatedAt: Date
}

export type AccountType = 
  | 'asset'
  | 'liability'
  | 'equity'
  | 'income'
  | 'expense'
  | 'cost_of_goods_sold'

export interface AccountTransaction {
  id: string
  date: Date
  description: string
  reference?: string
  
  // Journal entry
  journalEntryId: string
  account: Account
  debitAmount?: Money
  creditAmount?: Money
  
  // References
  invoiceId?: string
  paymentId?: string
  expenseId?: string
  
  // Reconciliation
  isReconciled: boolean
  reconciledAt?: Date
  
  // System
  createdAt: Date
}

export interface JournalEntry {
  id: string
  number: string
  date: Date
  description: string
  reference?: string
  
  // Transactions (debits and credits)
  transactions: AccountTransaction[]
  totalDebit: Money
  totalCredit: Money
  
  // Status
  isPosted: boolean
  postedAt?: Date
  postedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
}

// Reporting entities
export interface FinancialReport {
  id: string
  type: ReportType
  name: string
  period: ReportPeriod
  currency: Currency
  
  // Data
  data: ReportData
  generatedAt: Date
  generatedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  
  // Filters applied
  filters: ReportFilters
}

export type ReportType = 
  | 'profit_loss'
  | 'balance_sheet'
  | 'cash_flow'
  | 'trial_balance'
  | 'aged_receivables'
  | 'aged_payables'
  | 'sales_report'
  | 'expense_report'
  | 'tax_report'

export interface ReportPeriod {
  type: 'month' | 'quarter' | 'year' | 'custom'
  startDate: Date
  endDate: Date
  compareWith?: ReportPeriod
}

export interface ReportData {
  sections: ReportSection[]
  totals: Record<string, Money>
  comparisons?: Record<string, Money>
}

export interface ReportSection {
  name: string
  items: ReportItem[]
  subtotal?: Money
}

export interface ReportItem {
  account?: Account
  description: string
  amount: Money
  percentage?: number
  comparison?: Money
  varianceAmount?: Money
  variancePercentage?: number
}

export interface ReportFilters {
  accounts?: string[]
  contacts?: string[]
  projects?: string[]
  departments?: string[]
  includeInactive?: boolean
}

// Budget and forecasting
export interface Budget {
  id: string
  name: string
  type: 'annual' | 'quarterly' | 'monthly'
  year: number
  currency: Currency
  
  // Budget lines
  lines: BudgetLine[]
  
  // Status
  isActive: boolean
  isApproved: boolean
  approvedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>
  approvedAt?: Date
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
}

export interface BudgetLine {
  id: string
  account: Account
  department?: string
  project?: string
  
  // Amounts by period
  amounts: Record<string, Money> // month/quarter key -> amount
  
  // Actual vs budget tracking
  actualAmounts?: Record<string, Money>
  variance?: Record<string, Money>
  variancePercentage?: Record<string, number>
}

// Recurring transactions
export interface RecurringTransaction {
  id: string
  name: string
  type: 'invoice' | 'expense' | 'payment'
  
  // Template data
  templateData: any // Invoice/Expense template
  
  // Recurrence settings
  frequency: RecurrenceFrequency
  startDate: Date
  endDate?: Date
  nextDate: Date
  
  // Status
  isActive: boolean
  lastExecuted?: Date
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
}

export type RecurrenceFrequency = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annually'

// File attachments
export interface FileAttachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  uploadedAt: Date
}

// Analytics and metrics
export interface FinanceAnalytics {
  period: {
    start: Date
    end: Date
  }
  
  // Revenue metrics
  totalRevenue: Money
  recurringRevenue: Money
  newCustomerRevenue: Money
  averageInvoiceValue: Money
  
  // Cash flow metrics
  cashInflow: Money
  cashOutflow: Money
  netCashFlow: Money
  burningRate: Money
  
  // Receivables metrics
  totalReceivables: Money
  overdueAmount: Money
  averageCollectionDays: number
  dso: number // Days Sales Outstanding
  
  // Payables metrics
  totalPayables: Money
  overduePayables: Money
  averagePaymentDays: number
  dpo: number // Days Payable Outstanding
  
  // Profitability
  grossProfit: Money
  grossMargin: number
  netProfit: Money
  netMargin: number
  
  // Growth metrics
  revenueGrowth: number
  customerGrowth: number
  
  // Operational metrics
  invoicesSent: number
  quotesConverted: number
  conversionRate: number
  expenseRatio: number
}

// Dashboard widgets data
export interface RevenueWidget {
  totalRevenue: Money
  previousPeriod: Money
  growth: number
  trend: number[]
}

export interface CashFlowWidget {
  currentBalance: Money
  inflow: Money
  outflow: Money
  forecast: Array<{
    date: Date
    balance: Money
  }>
}

export interface ReceivablesWidget {
  total: Money
  overdue: Money
  current: Money
  aging: Array<{
    period: string
    amount: Money
    count: number
  }>
}

export interface ExpensesWidget {
  total: Money
  byCategory: Array<{
    category: string
    amount: Money
    percentage: number
  }>
  trend: number[]
}

// API request types
export interface CreateInvoiceRequest {
  contactId: string
  lineItems: Omit<LineItem, 'id'>[]
  currency: Currency
  dueDate: Date
  paymentTerms?: number
  notes?: string
  projectId?: string
}

export interface CreateQuoteRequest {
  contactId: string
  lineItems: Omit<LineItem, 'id'>[]
  currency: Currency
  validUntil: Date
  paymentTerms?: number
  notes?: string
  projectId?: string
}

export interface CreateExpenseRequest {
  description: string
  categoryId: string
  amount: Money
  expenseDate: Date
  supplierId?: string
  isReimbursable?: boolean
  receiptFile?: File
  notes?: string
}

export interface CreatePaymentRequest {
  type: 'incoming' | 'outgoing'
  amount: Money
  method: PaymentMethod
  paymentDate: Date
  fromContactId?: string
  toContactId?: string
  invoiceId?: string
  expenseId?: string
  notes?: string
}

export interface CreateContactRequest {
  type: 'customer' | 'supplier' | 'both'
  name: string
  email: string
  phone?: string
  companyName?: string
  billingAddress: Omit<Address, 'isDefault'>
  defaultCurrency: Currency
  defaultPaymentTerms?: number
}

// Hook return types
export interface UseInvoicesReturn {
  invoices: Invoice[]
  isLoading: boolean
  error: string | null
  createInvoice: (data: CreateInvoiceRequest) => Promise<Invoice>
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<Invoice>
  deleteInvoice: (id: string) => Promise<void>
  sendInvoice: (id: string) => Promise<void>
  markAsPaid: (id: string, paymentData: CreatePaymentRequest) => Promise<void>
  refresh: () => Promise<void>
}

export interface UseQuotesReturn {
  quotes: Quote[]
  isLoading: boolean
  error: string | null
  createQuote: (data: CreateQuoteRequest) => Promise<Quote>
  updateQuote: (id: string, data: Partial<Quote>) => Promise<Quote>
  deleteQuote: (id: string) => Promise<void>
  sendQuote: (id: string) => Promise<void>
  convertToInvoice: (id: string) => Promise<Invoice>
  refresh: () => Promise<void>
}

export interface UseExpensesReturn {
  expenses: Expense[]
  isLoading: boolean
  error: string | null
  createExpense: (data: CreateExpenseRequest) => Promise<Expense>
  updateExpense: (id: string, data: Partial<Expense>) => Promise<Expense>
  deleteExpense: (id: string) => Promise<void>
  submitExpense: (id: string) => Promise<void>
  approveExpense: (id: string, notes?: string) => Promise<void>
  rejectExpense: (id: string, reason: string) => Promise<void>
  refresh: () => Promise<void>
}

export interface UsePaymentsReturn {
  payments: Payment[]
  isLoading: boolean
  error: string | null
  createPayment: (data: CreatePaymentRequest) => Promise<Payment>
  updatePayment: (id: string, data: Partial<Payment>) => Promise<Payment>
  deletePayment: (id: string) => Promise<void>
  refundPayment: (id: string, amount?: Money) => Promise<Payment>
  refresh: () => Promise<void>
}

export interface UseContactsReturn {
  contacts: Contact[]
  isLoading: boolean
  error: string | null
  createContact: (data: CreateContactRequest) => Promise<Contact>
  updateContact: (id: string, data: Partial<Contact>) => Promise<Contact>
  deleteContact: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export interface UseFinanceAnalyticsReturn {
  analytics: FinanceAnalytics | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  updatePeriod: (start: Date, end: Date) => void
}

export interface UseReportsReturn {
  reports: FinancialReport[]
  isLoading: boolean
  error: string | null
  generateReport: (type: ReportType, period: ReportPeriod, filters?: ReportFilters) => Promise<FinancialReport>
  deleteReport: (id: string) => Promise<void>
  refresh: () => Promise<void>
}