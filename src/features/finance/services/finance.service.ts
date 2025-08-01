import { ky } from '@/services/api'
import type {
  Invoice,
  Quote,
  Expense,
  Payment,
  Contact,
  Product,
  TaxRate,
  Account,
  JournalEntry,
  FinancialReport,
  Budget,
  RecurringTransaction,
  FinanceAnalytics,
  Currency,
  Money,
  ExchangeRate,
  CreateInvoiceRequest,
  CreateQuoteRequest,
  CreateExpenseRequest,
  CreatePaymentRequest,
  CreateContactRequest,
  ReportType,
  ReportPeriod,
  ReportFilters,
  InvoiceStatus,
  QuoteStatus,
  ExpenseStatus,
  PaymentStatus,
  PaymentMethod
} from '../types/finance.types'
import { MOCK_INVOICES, MOCK_QUOTES, MOCK_CONTACTS, MOCK_PRODUCTS, MOCK_TAX_RATES } from '../mocks/finance.mocks'

// En mode développement, utiliser les mocks
const IS_DEVELOPMENT = import.meta.env.DEV

/**
 * Finance Service
 * Handles all finance-related API calls
 */
export class FinanceService {
  private static readonly ENDPOINTS = {
    // Invoices
    INVOICES: '/invoices',
    INVOICE_BY_ID: (id: string) => `/invoices/${id}`,
    SEND_INVOICE: (id: string) => `/invoices/${id}/send`,
    MARK_PAID: (id: string) => `/invoices/${id}/mark-paid`,
    INVOICE_PDF: (id: string) => `/invoices/${id}/pdf`,
    
    // Quotes
    QUOTES: '/quotes',
    QUOTE_BY_ID: (id: string) => `/quotes/${id}`,
    SEND_QUOTE: (id: string) => `/quotes/${id}/send`,
    CONVERT_QUOTE: (id: string) => `/quotes/${id}/convert`,
    QUOTE_PDF: (id: string) => `/quotes/${id}/pdf`,
    
    // Expenses
    EXPENSES: '/expenses',
    EXPENSE_BY_ID: (id: string) => `/expenses/${id}`,
    SUBMIT_EXPENSE: (id: string) => `/expenses/${id}/submit`,
    APPROVE_EXPENSE: (id: string) => `/expenses/${id}/approve`,
    REJECT_EXPENSE: (id: string) => `/expenses/${id}/reject`,
    EXPENSE_RECEIPT: (id: string) => `/expenses/${id}/receipt`,
    
    // Payments
    PAYMENTS: '/payments',
    PAYMENT_BY_ID: (id: string) => `/payments/${id}`,
    REFUND_PAYMENT: (id: string) => `/payments/${id}/refund`,
    
    // Contacts
    CONTACTS: '/contacts',
    CONTACT_BY_ID: (id: string) => `/contacts/${id}`,
    CUSTOMERS: '/contacts/customers',
    SUPPLIERS: '/contacts/suppliers',
    
    // Products
    PRODUCTS: '/products',
    PRODUCT_BY_ID: (id: string) => `/products/${id}`,
    PRODUCT_CATEGORIES: '/product-categories',
    
    // Tax management
    TAX_RATES: '/tax-rates',
    TAX_RATE_BY_ID: (id: string) => `/tax-rates/${id}`,
    
    // Accounting
    ACCOUNTS: '/accounts',
    ACCOUNT_BY_ID: (id: string) => `/accounts/${id}`,
    JOURNAL_ENTRIES: '/journal-entries',
    TRANSACTIONS: '/transactions',
    
    // Reports
    REPORTS: '/reports',
    REPORT_BY_ID: (id: string) => `/reports/${id}`,
    GENERATE_REPORT: '/reports/generate',
    
    // Analytics
    ANALYTICS: '/analytics/finance',
    DASHBOARD_WIDGETS: '/analytics/finance/widgets',
    
    // Currency and exchange rates
    CURRENCIES: '/currencies',
    EXCHANGE_RATES: '/exchange-rates',
    
    // Budget and forecasting
    BUDGETS: '/budgets',
    BUDGET_BY_ID: (id: string) => `/budgets/${id}`,
    
    // Recurring transactions
    RECURRING: '/recurring-transactions',
    RECURRING_BY_ID: (id: string) => `/recurring-transactions/${id}`,
    
    // File uploads
    UPLOAD_RECEIPT: '/uploads/receipt',
    UPLOAD_ATTACHMENT: '/uploads/attachment'
  } as const

  // Invoice Management

  /**
   * Get all invoices
   */
  static async getInvoices(params?: {
    status?: InvoiceStatus[]
    contactId?: string
    dateFrom?: Date
    dateTo?: Date
    search?: string
    page?: number
    limit?: number
  }): Promise<{ invoices: Invoice[]; total: number; page: number; limit: number }> {
    // En mode développement, utiliser les mocks
    if (import.meta.env.DEV) {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 300))
      
      let filteredInvoices = [...MOCK_INVOICES]
      
      // Appliquer les filtres
      if (params?.status && params.status.length > 0) {
        filteredInvoices = filteredInvoices.filter(inv => 
          params.status!.includes(inv.status)
        )
      }
      
      if (params?.contactId) {
        filteredInvoices = filteredInvoices.filter(inv => 
          inv.contactId === params.contactId
        )
      }
      
      if (params?.search) {
        const searchLower = params.search.toLowerCase()
        filteredInvoices = filteredInvoices.filter(inv => 
          inv.number.toLowerCase().includes(searchLower) ||
          inv.contact?.name.toLowerCase().includes(searchLower)
        )
      }
      
      // Pagination
      const page = params?.page || 1
      const limit = params?.limit || 20
      const start = (page - 1) * limit
      const paginatedInvoices = filteredInvoices.slice(start, start + limit)
      
      return {
        invoices: paginatedInvoices,
        total: filteredInvoices.length,
        page,
        limit
      }
    }
    
    // Code API réel
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value instanceof Date) {
          searchParams.append(key, value.toISOString())
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.INVOICES}?${searchParams.toString()}`).json<{
      invoices: Invoice[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Get invoice by ID
   */
  static async getInvoice(id: string): Promise<Invoice> {
    const response = await ky.get(this.ENDPOINTS.INVOICE_BY_ID(id)).json<Invoice>()
    return response
  }

  /**
   * Create new invoice
   */
  static async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    // En mode développement, utiliser les mocks
    if (import.meta.env.DEV) {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        number: `INV-2024-${String(MOCK_INVOICES.length + 1).padStart(4, '0')}`,
        status: 'draft',
        date: new Date().toISOString().split('T')[0],
        dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact: MOCK_CONTACTS.find(c => c.id === data.contactId),
        contactId: data.contactId,
        items: data.items || [],
        subtotalAmount: data.subtotalAmount || { amount: 0, currency: 'EUR' },
        taxAmount: data.taxAmount || { amount: 0, currency: 'EUR' },
        totalAmount: data.totalAmount || { amount: 0, currency: 'EUR' },
        paidAmount: { amount: 0, currency: 'EUR' },
        remainingAmount: data.totalAmount || { amount: 0, currency: 'EUR' },
        notes: data.notes,
        terms: data.terms,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      MOCK_INVOICES.push(newInvoice)
      return newInvoice
    }
    
    const response = await ky.post(this.ENDPOINTS.INVOICES, {
      json: data
    }).json<Invoice>()
    return response
  }

  /**
   * Update invoice
   */
  static async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    if (import.meta.env.DEV) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = MOCK_INVOICES.findIndex(inv => inv.id === id)
      if (index !== -1) {
        MOCK_INVOICES[index] = { ...MOCK_INVOICES[index], ...data, updatedAt: new Date().toISOString() }
        return MOCK_INVOICES[index]
      }
      throw new Error('Invoice not found')
    }
    
    const response = await ky.patch(this.ENDPOINTS.INVOICE_BY_ID(id), {
      json: data
    }).json<Invoice>()
    return response
  }

  /**
   * Delete invoice
   */
  static async deleteInvoice(id: string): Promise<void> {
    if (import.meta.env.DEV) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = MOCK_INVOICES.findIndex(inv => inv.id === id)
      if (index !== -1) {
        MOCK_INVOICES.splice(index, 1)
        return
      }
      throw new Error('Invoice not found')
    }
    
    await ky.delete(this.ENDPOINTS.INVOICE_BY_ID(id))
  }

  /**
   * Send invoice to customer
   */
  static async sendInvoice(id: string, options?: {
    subject?: string
    message?: string
    cc?: string[]
    bcc?: string[]
  }): Promise<void> {
    if (import.meta.env.DEV) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const invoice = MOCK_INVOICES.find(inv => inv.id === id)
      if (invoice && invoice.status === 'draft') {
        invoice.status = 'sent'
        invoice.updatedAt = new Date().toISOString()
        return
      }
      throw new Error('Invoice not found or not in draft status')
    }
    
    await ky.post(this.ENDPOINTS.SEND_INVOICE(id), {
      json: options || {}
    })
  }

  /**
   * Mark invoice as paid
   */
  static async markInvoiceAsPaid(id: string, paymentData?: Partial<CreatePaymentRequest>): Promise<void> {
    if (import.meta.env.DEV) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const invoice = MOCK_INVOICES.find(inv => inv.id === id)
      if (invoice) {
        invoice.status = 'paid'
        invoice.paidAmount = invoice.totalAmount
        invoice.remainingAmount = { amount: 0, currency: invoice.totalAmount.currency }
        invoice.updatedAt = new Date().toISOString()
        return
      }
      throw new Error('Invoice not found')
    }
    
    await ky.post(this.ENDPOINTS.MARK_PAID(id), {
      json: paymentData || {}
    })
  }

  /**
   * Generate invoice PDF
   */
  static async generateInvoicePDF(id: string): Promise<Blob> {
    if (import.meta.env.DEV) {
      await new Promise(resolve => setTimeout(resolve, 500))
      // Créer un blob PDF factice
      const pdfContent = `%PDF-1.4
Invoice ${id}
Mock PDF Content`;
      return new Blob([pdfContent], { type: 'application/pdf' })
    }
    
    const response = await ky.get(this.ENDPOINTS.INVOICE_PDF(id))
    return response.blob()
  }

  // Quote Management

  /**
   * Get all quotes
   */
  static async getQuotes(params?: {
    status?: QuoteStatus[]
    contactId?: string
    dateFrom?: Date
    dateTo?: Date
    search?: string
    page?: number
    limit?: number
  }): Promise<{ quotes: Quote[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value instanceof Date) {
          searchParams.append(key, value.toISOString())
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.QUOTES}?${searchParams.toString()}`).json<{
      quotes: Quote[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Create new quote
   */
  static async createQuote(data: CreateQuoteRequest): Promise<Quote> {
    const response = await ky.post(this.ENDPOINTS.QUOTES, {
      json: data
    }).json<Quote>()
    return response
  }

  /**
   * Update quote
   */
  static async updateQuote(id: string, data: Partial<Quote>): Promise<Quote> {
    const response = await ky.patch(this.ENDPOINTS.QUOTE_BY_ID(id), {
      json: data
    }).json<Quote>()
    return response
  }

  /**
   * Send quote to customer
   */
  static async sendQuote(id: string, options?: {
    subject?: string
    message?: string
    cc?: string[]
    bcc?: string[]
  }): Promise<void> {
    await ky.post(this.ENDPOINTS.SEND_QUOTE(id), {
      json: options || {}
    })
  }

  /**
   * Convert quote to invoice
   */
  static async convertQuoteToInvoice(id: string): Promise<Invoice> {
    const response = await ky.post(this.ENDPOINTS.CONVERT_QUOTE(id)).json<Invoice>()
    return response
  }

  // Expense Management

  /**
   * Get all expenses
   */
  static async getExpenses(params?: {
    status?: ExpenseStatus[]
    categoryId?: string
    submittedBy?: string
    dateFrom?: Date
    dateTo?: Date
    search?: string
    page?: number
    limit?: number
  }): Promise<{ expenses: Expense[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value instanceof Date) {
          searchParams.append(key, value.toISOString())
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.EXPENSES}?${searchParams.toString()}`).json<{
      expenses: Expense[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Create new expense
   */
  static async createExpense(data: CreateExpenseRequest): Promise<Expense> {
    const formData = new FormData()
    
    // Add expense data
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'receiptFile' && value instanceof File) {
        formData.append('receipt', value)
      } else if (key !== 'receiptFile' && value !== undefined) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    const response = await ky.post(this.ENDPOINTS.EXPENSES, {
      body: formData
    }).json<Expense>()
    
    return response
  }

  /**
   * Submit expense for approval
   */
  static async submitExpense(id: string): Promise<Expense> {
    const response = await ky.post(this.ENDPOINTS.SUBMIT_EXPENSE(id)).json<Expense>()
    return response
  }

  /**
   * Approve expense
   */
  static async approveExpense(id: string, notes?: string): Promise<Expense> {
    const response = await ky.post(this.ENDPOINTS.APPROVE_EXPENSE(id), {
      json: { notes }
    }).json<Expense>()
    return response
  }

  /**
   * Reject expense
   */
  static async rejectExpense(id: string, reason: string): Promise<Expense> {
    const response = await ky.post(this.ENDPOINTS.REJECT_EXPENSE(id), {
      json: { reason }
    }).json<Expense>()
    return response
  }

  // Payment Management

  /**
   * Get all payments
   */
  static async getPayments(params?: {
    status?: PaymentStatus[]
    type?: 'incoming' | 'outgoing'
    method?: PaymentMethod[]
    contactId?: string
    dateFrom?: Date
    dateTo?: Date
    page?: number
    limit?: number
  }): Promise<{ payments: Payment[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value instanceof Date) {
          searchParams.append(key, value.toISOString())
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.PAYMENTS}?${searchParams.toString()}`).json<{
      payments: Payment[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Create new payment
   */
  static async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    const response = await ky.post(this.ENDPOINTS.PAYMENTS, {
      json: data
    }).json<Payment>()
    return response
  }

  /**
   * Refund payment
   */
  static async refundPayment(id: string, amount?: Money): Promise<Payment> {
    const response = await ky.post(this.ENDPOINTS.REFUND_PAYMENT(id), {
      json: { amount }
    }).json<Payment>()
    return response
  }

  // Contact Management

  /**
   * Get all contacts
   */
  static async getContacts(params?: {
    type?: 'customer' | 'supplier' | 'both'
    search?: string
    tags?: string[]
    isActive?: boolean
    page?: number
    limit?: number
  }): Promise<{ contacts: Contact[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.CONTACTS}?${searchParams.toString()}`).json<{
      contacts: Contact[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Create new contact
   */
  static async createContact(data: CreateContactRequest): Promise<Contact> {
    const response = await ky.post(this.ENDPOINTS.CONTACTS, {
      json: data
    }).json<Contact>()
    return response
  }

  /**
   * Update contact
   */
  static async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    const response = await ky.patch(this.ENDPOINTS.CONTACT_BY_ID(id), {
      json: data
    }).json<Contact>()
    return response
  }

  // Product Management

  /**
   * Get all products
   */
  static async getProducts(params?: {
    categoryId?: string
    isActive?: boolean
    search?: string
    page?: number
    limit?: number
  }): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.PRODUCTS}?${searchParams.toString()}`).json<{
      products: Product[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Create new product
   */
  static async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await ky.post(this.ENDPOINTS.PRODUCTS, {
      json: data
    }).json<Product>()
    return response
  }

  // Tax Management

  /**
   * Get all tax rates
   */
  static async getTaxRates(country?: string): Promise<TaxRate[]> {
    const url = country 
      ? `${this.ENDPOINTS.TAX_RATES}?country=${country}`
      : this.ENDPOINTS.TAX_RATES
    
    const response = await ky.get(url).json<TaxRate[]>()
    return response
  }

  // Accounting

  /**
   * Get chart of accounts
   */
  static async getAccounts(): Promise<Account[]> {
    const response = await ky.get(this.ENDPOINTS.ACCOUNTS).json<Account[]>()
    return response
  }

  /**
   * Get journal entries
   */
  static async getJournalEntries(params?: {
    dateFrom?: Date
    dateTo?: Date
    accountId?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{ entries: JournalEntry[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value instanceof Date) {
          searchParams.append(key, value.toISOString())
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.JOURNAL_ENTRIES}?${searchParams.toString()}`).json<{
      entries: JournalEntry[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  // Reports

  /**
   * Generate financial report
   */
  static async generateReport(
    type: ReportType,
    period: ReportPeriod,
    filters?: ReportFilters
  ): Promise<FinancialReport> {
    const response = await ky.post(this.ENDPOINTS.GENERATE_REPORT, {
      json: { type, period, filters }
    }).json<FinancialReport>()
    return response
  }

  /**
   * Get saved reports
   */
  static async getReports(): Promise<FinancialReport[]> {
    const response = await ky.get(this.ENDPOINTS.REPORTS).json<FinancialReport[]>()
    return response
  }

  // Analytics

  /**
   * Get finance analytics
   */
  static async getFinanceAnalytics(
    startDate: Date,
    endDate: Date,
    currency?: Currency
  ): Promise<FinanceAnalytics> {
    const searchParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })

    if (currency) {
      searchParams.append('currency', currency)
    }

    const response = await ky.get(
      `${this.ENDPOINTS.ANALYTICS}?${searchParams.toString()}`
    ).json<FinanceAnalytics>()
    
    return response
  }

  /**
   * Get dashboard widgets data
   */
  static async getDashboardWidgets(currency?: Currency): Promise<{
    revenue: any
    cashFlow: any
    receivables: any
    expenses: any
  }> {
    const url = currency 
      ? `${this.ENDPOINTS.DASHBOARD_WIDGETS}?currency=${currency}`
      : this.ENDPOINTS.DASHBOARD_WIDGETS
    
    const response = await ky.get(url).json<{
      revenue: any
      cashFlow: any
      receivables: any
      expenses: any
    }>()
    
    return response
  }

  // Currency and Exchange Rates

  /**
   * Get supported currencies
   */
  static async getCurrencies(): Promise<Currency[]> {
    const response = await ky.get(this.ENDPOINTS.CURRENCIES).json<Currency[]>()
    return response
  }

  /**
   * Get exchange rates
   */
  static async getExchangeRates(base: Currency, targets?: Currency[]): Promise<ExchangeRate[]> {
    const searchParams = new URLSearchParams({ base })
    
    if (targets) {
      targets.forEach(target => searchParams.append('target', target))
    }

    const response = await ky.get(
      `${this.ENDPOINTS.EXCHANGE_RATES}?${searchParams.toString()}`
    ).json<ExchangeRate[]>()
    
    return response
  }

  // Budget Management

  /**
   * Get budgets
   */
  static async getBudgets(year?: number): Promise<Budget[]> {
    const url = year 
      ? `${this.ENDPOINTS.BUDGETS}?year=${year}`
      : this.ENDPOINTS.BUDGETS
    
    const response = await ky.get(url).json<Budget[]>()
    return response
  }

  // Recurring Transactions

  /**
   * Get recurring transactions
   */
  static async getRecurringTransactions(): Promise<RecurringTransaction[]> {
    const response = await ky.get(this.ENDPOINTS.RECURRING).json<RecurringTransaction[]>()
    return response
  }

  /**
   * Create recurring transaction
   */
  static async createRecurringTransaction(data: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    const response = await ky.post(this.ENDPOINTS.RECURRING, {
      json: data
    }).json<RecurringTransaction>()
    return response
  }

  // File Upload

  /**
   * Upload receipt file
   */
  static async uploadReceipt(file: File): Promise<{ url: string; id: string }> {
    const formData = new FormData()
    formData.append('receipt', file)

    const response = await ky.post(this.ENDPOINTS.UPLOAD_RECEIPT, {
      body: formData
    }).json<{ url: string; id: string }>()
    
    return response
  }

  /**
   * Upload attachment
   */
  static async uploadAttachment(file: File, type: 'invoice' | 'quote' | 'expense'): Promise<{ url: string; id: string }> {
    const formData = new FormData()
    formData.append('attachment', file)
    formData.append('type', type)

    const response = await ky.post(this.ENDPOINTS.UPLOAD_ATTACHMENT, {
      body: formData
    }).json<{ url: string; id: string }>()
    
    return response
  }
}

/**
 * Finance Utilities
 * Helper functions for financial calculations and formatting
 */
export class FinanceUtils {
  /**
   * Format money amount with currency
   */
  static formatMoney(money: Money, options?: {
    showCurrency?: boolean
    decimals?: number
    locale?: string
  }): string {
    const { showCurrency = true, decimals = 2, locale = 'fr-FR' } = options || {}

    const formatter = new Intl.NumberFormat(locale, {
      style: showCurrency ? 'currency' : 'decimal',
      currency: money.currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })

    return formatter.format(money.amount)
  }

  /**
   * Convert money between currencies
   */
  static convertMoney(money: Money, targetCurrency: Currency, exchangeRate: number): Money {
    return {
      amount: money.amount * exchangeRate,
      currency: targetCurrency
    }
  }

  /**
   * Add money amounts (same currency)
   */
  static addMoney(a: Money, b: Money): Money {
    if (a.currency !== b.currency) {
      throw new Error('Cannot add money with different currencies')
    }
    
    return {
      amount: a.amount + b.amount,
      currency: a.currency
    }
  }

  /**
   * Subtract money amounts (same currency)
   */
  static subtractMoney(a: Money, b: Money): Money {
    if (a.currency !== b.currency) {
      throw new Error('Cannot subtract money with different currencies')
    }
    
    return {
      amount: a.amount - b.amount,
      currency: a.currency
    }
  }

  /**
   * Multiply money by a factor
   */
  static multiplyMoney(money: Money, factor: number): Money {
    return {
      amount: money.amount * factor,
      currency: money.currency
    }
  }

  /**
   * Calculate percentage of money amount
   */
  static percentageOfMoney(money: Money, percentage: number): Money {
    return {
      amount: (money.amount * percentage) / 100,
      currency: money.currency
    }
  }

  /**
   * Calculate tax amount
   */
  static calculateTax(amount: Money, taxRate: number): Money {
    return this.percentageOfMoney(amount, taxRate)
  }

  /**
   * Calculate discount amount
   */
  static calculateDiscount(amount: Money, discountPercent: number): Money {
    return this.percentageOfMoney(amount, discountPercent)
  }

  /**
   * Calculate line item total
   */
  static calculateLineItemTotal(
    quantity: number,
    unitPrice: Money,
    discountPercent?: number,
    taxRates: number[] = []
  ): {
    subtotal: Money
    discount: Money
    tax: Money
    total: Money
  } {
    const subtotal = this.multiplyMoney(unitPrice, quantity)
    const discount = discountPercent ? this.calculateDiscount(subtotal, discountPercent) : { amount: 0, currency: unitPrice.currency }
    const taxableAmount = this.subtractMoney(subtotal, discount)
    
    const totalTaxRate = taxRates.reduce((sum, rate) => sum + rate, 0)
    const tax = this.calculateTax(taxableAmount, totalTaxRate)
    
    const total = this.addMoney(taxableAmount, tax)

    return { subtotal, discount, tax, total }
  }

  /**
   * Get invoice status color
   */
  static getInvoiceStatusColor(status: InvoiceStatus): string {
    const colors = {
      draft: 'text-gray-600 bg-gray-100',
      sent: 'text-blue-600 bg-blue-100',
      viewed: 'text-cyan-600 bg-cyan-100',
      partial: 'text-orange-600 bg-orange-100',
      paid: 'text-green-600 bg-green-100',
      overdue: 'text-red-600 bg-red-100',
      cancelled: 'text-gray-600 bg-gray-100',
      refunded: 'text-purple-600 bg-purple-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  /**
   * Get quote status color
   */
  static getQuoteStatusColor(status: QuoteStatus): string {
    const colors = {
      draft: 'text-gray-600 bg-gray-100',
      sent: 'text-blue-600 bg-blue-100',
      viewed: 'text-cyan-600 bg-cyan-100',
      accepted: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      expired: 'text-orange-600 bg-orange-100',
      converted: 'text-purple-600 bg-purple-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  /**
   * Get expense status color
   */
  static getExpenseStatusColor(status: ExpenseStatus): string {
    const colors = {
      draft: 'text-gray-600 bg-gray-100',
      submitted: 'text-blue-600 bg-blue-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      paid: 'text-green-600 bg-green-100',
      reimbursed: 'text-purple-600 bg-purple-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  /**
   * Get payment status color
   */
  static getPaymentStatusColor(status: PaymentStatus): string {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      processing: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100',
      cancelled: 'text-gray-600 bg-gray-100',
      refunded: 'text-purple-600 bg-purple-100',
      disputed: 'text-orange-600 bg-orange-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  /**
   * Format invoice status
   */
  static formatInvoiceStatus(status: InvoiceStatus): string {
    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      viewed: 'Consultée',
      partial: 'Partiellement payée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
      refunded: 'Remboursée'
    }
    return labels[status] || status
  }

  /**
   * Format quote status
   */
  static formatQuoteStatus(status: QuoteStatus): string {
    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      viewed: 'Consulté',
      accepted: 'Accepté',
      rejected: 'Rejeté',
      expired: 'Expiré',
      converted: 'Converti'
    }
    return labels[status] || status
  }

  /**
   * Format payment method
   */
  static formatPaymentMethod(method: PaymentMethod): string {
    const labels = {
      bank_transfer: 'Virement bancaire',
      credit_card: 'Carte de crédit',
      debit_card: 'Carte de débit',
      paypal: 'PayPal',
      stripe: 'Stripe',
      cash: 'Espèces',
      check: 'Chèque',
      crypto: 'Cryptomonnaie'
    }
    return labels[method] || method
  }

  /**
   * Calculate days overdue
   */
  static calculateDaysOverdue(dueDate: Date): number {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = now.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  /**
   * Calculate days until due
   */
  static calculateDaysUntilDue(dueDate: Date): number {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  /**
   * Check if invoice is overdue
   */
  static isOverdue(dueDate: Date): boolean {
    return new Date() > new Date(dueDate)
  }

  /**
   * Generate next invoice number
   */
  static generateInvoiceNumber(lastNumber?: string, prefix = 'INV'): string {
    if (!lastNumber) {
      const year = new Date().getFullYear()
      return `${prefix}-${year}-0001`
    }

    const parts = lastNumber.split('-')
    if (parts.length >= 3) {
      const year = new Date().getFullYear()
      const currentYear = parseInt(parts[1])
      
      if (year > currentYear) {
        return `${prefix}-${year}-0001`
      } else {
        const number = parseInt(parts[2]) + 1
        return `${prefix}-${year}-${number.toString().padStart(4, '0')}`
      }
    }

    // Fallback
    const year = new Date().getFullYear()
    return `${prefix}-${year}-0001`
  }

  /**
   * Generate next quote number
   */
  static generateQuoteNumber(lastNumber?: string, prefix = 'QUO'): string {
    return this.generateInvoiceNumber(lastNumber, prefix)
  }

  /**
   * Calculate aging buckets for receivables
   */
  static calculateAgingBuckets(invoices: Invoice[]): Array<{
    bucket: string
    amount: Money
    count: number
  }> {
    const buckets = [
      { bucket: 'Current', min: -Infinity, max: 0, amount: 0, count: 0 },
      { bucket: '1-30 days', min: 1, max: 30, amount: 0, count: 0 },
      { bucket: '31-60 days', min: 31, max: 60, amount: 0, count: 0 },
      { bucket: '61-90 days', min: 61, max: 90, amount: 0, count: 0 },
      { bucket: '90+ days', min: 91, max: Infinity, amount: 0, count: 0 }
    ]

    const baseCurrency = invoices[0]?.currency || 'EUR'

    invoices.forEach(invoice => {
      if (invoice.status === 'paid') return

      const daysOverdue = this.calculateDaysOverdue(invoice.dueDate)
      const bucket = buckets.find(b => daysOverdue >= b.min && daysOverdue <= b.max)
      
      if (bucket) {
        bucket.amount += invoice.remainingAmount.amount
        bucket.count += 1
      }
    })

    return buckets.map(bucket => ({
      bucket: bucket.bucket,
      amount: { amount: bucket.amount, currency: baseCurrency },
      count: bucket.count
    }))
  }
}