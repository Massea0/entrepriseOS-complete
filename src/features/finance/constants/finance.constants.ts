import type { InvoiceStatus, Currency, PaymentMethod } from '../types/finance.types'

/**
 * Finance Module Constants
 * Constantes utilisées dans tout le module Finance
 */

// Statuts des factures
export const INVOICE_STATUS: Record<InvoiceStatus, { label: string; color: string; icon?: string }> = {
  draft: {
    label: 'Brouillon',
    color: 'bg-gray-100 text-gray-800',
    icon: 'FileTextIcon'
  },
  sent: {
    label: 'Envoyée',
    color: 'bg-blue-100 text-blue-800',
    icon: 'SendIcon'
  },
  viewed: {
    label: 'Vue',
    color: 'bg-purple-100 text-purple-800',
    icon: 'EyeIcon'
  },
  paid: {
    label: 'Payée',
    color: 'bg-green-100 text-green-800',
    icon: 'CheckIcon'
  },
  partial: {
    label: 'Paiement partiel',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'DollarSignIcon'
  },
  overdue: {
    label: 'En retard',
    color: 'bg-red-100 text-red-800',
    icon: 'XIcon'
  },
  cancelled: {
    label: 'Annulée',
    color: 'bg-gray-100 text-gray-800',
    icon: 'XIcon'
  }
}

// Devises supportées
export const CURRENCIES: Record<Currency, { label: string; symbol: string; locale: string }> = {
  EUR: {
    label: 'Euro',
    symbol: '€',
    locale: 'fr-FR'
  },
  USD: {
    label: 'Dollar US',
    symbol: '$',
    locale: 'en-US'
  },
  GBP: {
    label: 'Livre Sterling',
    symbol: '£',
    locale: 'en-GB'
  }
}

// Méthodes de paiement
export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  bank_transfer: 'Virement bancaire',
  credit_card: 'Carte de crédit',
  paypal: 'PayPal',
  check: 'Chèque',
  cash: 'Espèces',
  other: 'Autre'
}

// Taux de TVA standards
export const TAX_RATES = [
  { value: 0, label: '0% - Exonéré' },
  { value: 5.5, label: '5.5% - Taux réduit' },
  { value: 10, label: '10% - Taux intermédiaire' },
  { value: 20, label: '20% - Taux normal' }
]

// Conditions de paiement
export const PAYMENT_TERMS = [
  { value: 0, label: 'Paiement immédiat' },
  { value: 15, label: 'Net 15 jours' },
  { value: 30, label: 'Net 30 jours' },
  { value: 45, label: 'Net 45 jours' },
  { value: 60, label: 'Net 60 jours' },
  { value: 90, label: 'Net 90 jours' }
]

// Configuration par défaut
export const DEFAULT_INVOICE_CONFIG = {
  currency: 'EUR' as Currency,
  taxRate: 20,
  paymentTerms: 30,
  numberPrefix: 'INV',
  logoUrl: null,
  companyInfo: {
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    phone: '',
    email: '',
    website: '',
    siret: '',
    vatNumber: ''
  }
}

// Messages de validation
export const VALIDATION_MESSAGES = {
  required: 'Ce champ est obligatoire',
  invalidEmail: 'Email invalide',
  invalidPhone: 'Numéro de téléphone invalide',
  invalidAmount: 'Montant invalide',
  invalidDate: 'Date invalide',
  invalidInvoiceNumber: 'Numéro de facture invalide (format: INV-YYYY-XXXX)',
  minAmount: 'Le montant doit être supérieur à 0',
  maxAmount: 'Le montant est trop élevé',
  dateInPast: 'La date ne peut pas être dans le passé',
  duplicateInvoiceNumber: 'Ce numéro de facture existe déjà'
}

// Templates d'email
export const EMAIL_TEMPLATES = {
  invoice_send: {
    subject: 'Facture {invoiceNumber} - {companyName}',
    body: `Bonjour {contactName},

Veuillez trouver ci-joint la facture {invoiceNumber} d'un montant de {amount}.

Date d'échéance : {dueDate}

Cordialement,
{companyName}`
  },
  invoice_reminder: {
    subject: 'Rappel - Facture {invoiceNumber} en attente',
    body: `Bonjour {contactName},

Nous vous rappelons que la facture {invoiceNumber} d'un montant de {amount} est en attente de paiement.

Cette facture était due le {dueDate}.

Merci de procéder au règlement dans les meilleurs délais.

Cordialement,
{companyName}`
  },
  quote_send: {
    subject: 'Devis {quoteNumber} - {companyName}',
    body: `Bonjour {contactName},

Suite à notre échange, veuillez trouver ci-joint le devis {quoteNumber} d'un montant de {amount}.

Ce devis est valable jusqu'au {expiryDate}.

N'hésitez pas à nous contacter pour toute question.

Cordialement,
{companyName}`
  }
}

// Limites et contraintes
export const LIMITS = {
  maxLineItems: 100,
  maxDescriptionLength: 1000,
  maxNotesLength: 5000,
  maxAttachmentSize: 10 * 1024 * 1024, // 10MB
  maxAttachments: 10
}

// Intervalles de rafraîchissement (ms)
export const REFRESH_INTERVALS = {
  metrics: 60000, // 1 minute
  invoiceList: 30000, // 30 secondes
  notifications: 10000 // 10 secondes
}

// Filtres par défaut
export const DEFAULT_FILTERS = {
  status: 'all',
  dateRange: 'last_30_days',
  sortBy: 'date',
  sortOrder: 'desc' as const,
  pageSize: 20
}