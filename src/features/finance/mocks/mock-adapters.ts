import type { Invoice, Contact, Product, Money, Address, User } from '../types/finance.types'
import { MOCK_INVOICES, MOCK_CONTACTS, MOCK_PRODUCTS } from './finance.mocks'

// Mock user for createdBy fields
const MOCK_USER: Pick<User, 'id' | 'firstName' | 'lastName'> = {
  id: 'user-1',
  firstName: 'Admin',
  lastName: 'User'
}

// Convert simple mock contact to official Contact type
export function toOfficialContact(mockContact: any): Contact {
  const billingAddress: Address = {
    street: mockContact.address || '123 rue Default',
    city: mockContact.city || 'Paris',
    postalCode: mockContact.postalCode || '75001',
    country: mockContact.country || 'France',
    isDefault: true
  }

  return {
    id: mockContact.id,
    type: mockContact.type === 'company' ? 'customer' : 'customer',
    name: mockContact.name,
    email: mockContact.email,
    phone: mockContact.phone,
    companyName: mockContact.type === 'company' ? mockContact.name : undefined,
    vatNumber: mockContact.taxNumber,
    billingAddress,
    defaultCurrency: 'EUR',
    defaultPaymentTerms: 30,
    creditLimit: { amount: 50000, currency: 'EUR' },
    customerSince: new Date('2024-01-01'),
    isActive: true,
    tags: [],
    notes: '',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
}

// Convert simple mock invoice to official Invoice type
export function toOfficialInvoice(mockInvoice: any): Invoice {
  const contact = toOfficialContact(mockInvoice.contact || MOCK_CONTACTS[0])
  
  return {
    id: mockInvoice.id,
    number: mockInvoice.number,
    status: mockInvoice.status,
    contact,
    billingAddress: contact.billingAddress,
    issueDate: new Date(mockInvoice.date || new Date()),
    dueDate: new Date(mockInvoice.dueDate || new Date()),
    paidDate: mockInvoice.status === 'paid' ? new Date() : undefined,
    currency: 'EUR',
    lineItems: mockInvoice.items || [],
    subtotal: mockInvoice.subtotalAmount || { amount: 0, currency: 'EUR' },
    totalTax: mockInvoice.taxAmount || { amount: 0, currency: 'EUR' },
    totalDiscount: { amount: 0, currency: 'EUR' },
    totalAmount: mockInvoice.totalAmount || { amount: 0, currency: 'EUR' },
    paidAmount: mockInvoice.paidAmount || { amount: 0, currency: 'EUR' },
    remainingAmount: mockInvoice.remainingAmount || { amount: 0, currency: 'EUR' },
    paymentTerms: 30,
    attachments: [],
    createdBy: MOCK_USER,
    createdAt: new Date(mockInvoice.createdAt || new Date()),
    updatedAt: new Date(mockInvoice.updatedAt || new Date()),
    notes: mockInvoice.notes
  }
}

// Convert simple mock product to official Product type
export function toOfficialProduct(mockProduct: any): Product {
  return {
    id: mockProduct.id,
    name: mockProduct.name,
    description: mockProduct.description,
    sku: `SKU-${mockProduct.id}`,
    category: 'service',
    type: 'service',
    unit: mockProduct.unit || 'unit',
    price: mockProduct.price || { amount: 0, currency: 'EUR' },
    taxRate: mockProduct.taxRate || 20,
    isActive: true,
    isTaxInclusive: false,
    tags: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
}

// Get adapted invoices
export function getAdaptedInvoices(): Invoice[] {
  return MOCK_INVOICES.map(toOfficialInvoice)
}

// Get adapted contacts  
export function getAdaptedContacts(): Contact[] {
  return MOCK_CONTACTS.map(toOfficialContact)
}

// Get adapted products
export function getAdaptedProducts(): Product[] {
  return MOCK_PRODUCTS.map(toOfficialProduct)
}