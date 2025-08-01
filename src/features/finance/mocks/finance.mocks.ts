import type { Invoice, Contact, Product, TaxRate, Quote } from '../types/finance.types'

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'contact-1',
    name: 'Entreprise ABC',
    email: 'contact@entreprise-abc.com',
    phone: '+33 1 23 45 67 89',
    address: '123 rue de la Paix',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    type: 'company',
    taxNumber: 'FR12345678901'
  },
  {
    id: 'contact-2',
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    address: '456 avenue des Champs',
    city: 'Lyon',
    postalCode: '69000',
    country: 'France',
    type: 'individual'
  },
  {
    id: 'contact-3',
    name: 'Tech Solutions SAS',
    email: 'info@techsolutions.fr',
    phone: '+33 1 98 76 54 32',
    address: '789 boulevard Innovation',
    city: 'Toulouse',
    postalCode: '31000',
    country: 'France',
    type: 'company',
    taxNumber: 'FR98765432109'
  }
]

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Consultation IT',
    description: 'Consultation technique sur site',
    price: { amount: 800, currency: 'EUR' },
    unit: 'jour',
    taxRate: 20
  },
  {
    id: 'prod-2',
    name: 'Développement Web',
    description: 'Développement application web sur mesure',
    price: { amount: 600, currency: 'EUR' },
    unit: 'jour',
    taxRate: 20
  },
  {
    id: 'prod-3',
    name: 'Formation',
    description: 'Formation professionnelle en entreprise',
    price: { amount: 1200, currency: 'EUR' },
    unit: 'jour',
    taxRate: 20
  },
  {
    id: 'prod-4',
    name: 'Support Technique',
    description: 'Support et maintenance applicative',
    price: { amount: 150, currency: 'EUR' },
    unit: 'heure',
    taxRate: 20
  }
]

export const MOCK_TAX_RATES: TaxRate[] = [
  { id: 'tax-1', name: 'TVA 20%', rate: 20, isDefault: true },
  { id: 'tax-2', name: 'TVA 10%', rate: 10, isDefault: false },
  { id: 'tax-3', name: 'TVA 5.5%', rate: 5.5, isDefault: false },
  { id: 'tax-4', name: 'Exonéré', rate: 0, isDefault: false }
]

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    number: 'INV-2024-0001',
    status: 'paid',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    contact: MOCK_CONTACTS[0],
    contactId: 'contact-1',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        description: 'Consultation IT - 5 jours',
        quantity: 5,
        unitPrice: 800,
        taxRate: 20,
        totalPrice: 4000
      }
    ],
    subtotalAmount: { amount: 4000, currency: 'EUR' },
    taxAmount: { amount: 800, currency: 'EUR' },
    totalAmount: { amount: 4800, currency: 'EUR' },
    paidAmount: { amount: 4800, currency: 'EUR' },
    remainingAmount: { amount: 0, currency: 'EUR' },
    notes: 'Projet de migration infrastructure',
    terms: 'Paiement à 30 jours',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-10T14:30:00Z'
  },
  {
    id: 'inv-002',
    number: 'INV-2024-0002',
    status: 'overdue',
    date: '2024-01-20',
    dueDate: '2024-02-20',
    contact: MOCK_CONTACTS[1],
    contactId: 'contact-2',
    items: [
      {
        id: 'item-2',
        productId: 'prod-2',
        description: 'Développement Web - Site e-commerce',
        quantity: 10,
        unitPrice: 600,
        taxRate: 20,
        totalPrice: 6000
      },
      {
        id: 'item-3',
        productId: 'prod-4',
        description: 'Support technique',
        quantity: 8,
        unitPrice: 150,
        taxRate: 20,
        totalPrice: 1200
      }
    ],
    subtotalAmount: { amount: 7200, currency: 'EUR' },
    taxAmount: { amount: 1440, currency: 'EUR' },
    totalAmount: { amount: 8640, currency: 'EUR' },
    paidAmount: { amount: 0, currency: 'EUR' },
    remainingAmount: { amount: 8640, currency: 'EUR' },
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z'
  },
  {
    id: 'inv-003',
    number: 'INV-2024-0003',
    status: 'sent',
    date: '2024-02-01',
    dueDate: '2024-03-01',
    contact: MOCK_CONTACTS[2],
    contactId: 'contact-3',
    items: [
      {
        id: 'item-4',
        productId: 'prod-3',
        description: 'Formation React avancé - 3 jours',
        quantity: 3,
        unitPrice: 1200,
        taxRate: 20,
        totalPrice: 3600
      }
    ],
    subtotalAmount: { amount: 3600, currency: 'EUR' },
    taxAmount: { amount: 720, currency: 'EUR' },
    totalAmount: { amount: 4320, currency: 'EUR' },
    paidAmount: { amount: 0, currency: 'EUR' },
    remainingAmount: { amount: 4320, currency: 'EUR' },
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-05T10:00:00Z'
  },
  {
    id: 'inv-004',
    number: 'INV-2024-0004',
    status: 'draft',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contact: MOCK_CONTACTS[0],
    contactId: 'contact-1',
    items: [
      {
        id: 'item-5',
        productId: 'prod-1',
        description: 'Audit de sécurité',
        quantity: 2,
        unitPrice: 800,
        taxRate: 20,
        totalPrice: 1600
      }
    ],
    subtotalAmount: { amount: 1600, currency: 'EUR' },
    taxAmount: { amount: 320, currency: 'EUR' },
    totalAmount: { amount: 1920, currency: 'EUR' },
    paidAmount: { amount: 0, currency: 'EUR' },
    remainingAmount: { amount: 1920, currency: 'EUR' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv-005',
    number: 'INV-2024-0005',
    status: 'partial',
    date: '2024-01-25',
    dueDate: '2024-02-25',
    contact: MOCK_CONTACTS[2],
    contactId: 'contact-3',
    items: [
      {
        id: 'item-6',
        productId: 'prod-2',
        description: 'Développement API REST',
        quantity: 15,
        unitPrice: 600,
        taxRate: 20,
        totalPrice: 9000
      }
    ],
    subtotalAmount: { amount: 9000, currency: 'EUR' },
    taxAmount: { amount: 1800, currency: 'EUR' },
    totalAmount: { amount: 10800, currency: 'EUR' },
    paidAmount: { amount: 5400, currency: 'EUR' },
    remainingAmount: { amount: 5400, currency: 'EUR' },
    notes: 'Acompte de 50% reçu',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-02-15T16:00:00Z'
  }
]

export const MOCK_QUOTES: Quote[] = [
  {
    id: 'quote-001',
    number: 'DEVIS-2024-0001',
    status: 'sent',
    date: '2024-02-10',
    validUntil: '2024-03-10',
    contact: MOCK_CONTACTS[0],
    contactId: 'contact-1',
    items: [
      {
        id: 'qitem-1',
        productId: 'prod-1',
        description: 'Audit complet infrastructure',
        quantity: 10,
        unitPrice: 800,
        taxRate: 20,
        totalPrice: 8000
      }
    ],
    subtotalAmount: { amount: 8000, currency: 'EUR' },
    taxAmount: { amount: 1600, currency: 'EUR' },
    totalAmount: { amount: 9600, currency: 'EUR' },
    notes: 'Devis valable 30 jours',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z'
  }
]