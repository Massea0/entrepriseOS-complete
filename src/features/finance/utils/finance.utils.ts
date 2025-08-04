import type { Money, Currency, TaxRate, LineItem } from '../types/finance.types'

/**
 * Finance Utility Functions
 * Fonctions utilitaires pour les calculs financiers et le formatage
 */

// Formatage de devises
export const formatCurrency = (amount: number, currency: Currency = 'EUR'): string => {
  const locale = currency === 'EUR' ? 'fr-FR' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount)
}

// Formatage de dates
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-'
  
  const d = new Date(date)
  
  // Vérifier si la date est valide
  if (isNaN(d.getTime())) {
    return '-'
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d)
}

// Formatage date complète
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-'
  
  const d = new Date(date)
  
  // Vérifier si la date est valide
  if (isNaN(d.getTime())) {
    return '-'
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

// Calcul du sous-total
export const calculateSubtotal = (items: LineItem[]): number => {
  return items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
}

// Calcul de la TVA
export const calculateTax = (amount: number, taxRate: number): number => {
  return amount * (taxRate / 100)
}

// Calcul du total avec TVA
export const calculateTotal = (subtotal: number, taxRate: number): number => {
  return subtotal + calculateTax(subtotal, taxRate)
}

// Calcul total facture avec items
export const calculateInvoiceTotal = (items: LineItem[], taxRate: number = 20): Money => {
  const subtotal = calculateSubtotal(items)
  const tax = calculateTax(subtotal, taxRate)
  const total = subtotal + tax
  
  return {
    amount: total,
    currency: 'EUR'
  }
}

// Validation du numéro de facture
export const validateInvoiceNumber = (number: string): boolean => {
  // Format: INV-YYYY-XXXX
  const pattern = /^INV-\d{4}-\d{4}$/
  return pattern.test(number)
}

// Génération du numéro de facture
export const generateInvoiceNumber = (lastNumber?: string): string => {
  const year = new Date().getFullYear()
  let sequence = 1
  
  if (lastNumber) {
    const match = lastNumber.match(/INV-(\d{4})-(\d{4})/)
    if (match && parseInt(match[1]) === year) {
      sequence = parseInt(match[2]) + 1
    }
  }
  
  return `INV-${year}-${sequence.toString().padStart(4, '0')}`
}

// Calcul des jours de retard
export const calculateDaysOverdue = (dueDate: string | Date | null | undefined): number => {
  if (!dueDate) return 0
  
  const due = new Date(dueDate)
  
  // Vérifier si la date est valide
  if (isNaN(due.getTime())) {
    return 0
  }
  
  const today = new Date()
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

// Formatage du statut avec couleur
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    viewed: 'bg-purple-100 text-purple-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Formatage du statut en français
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    viewed: 'Vue',
    paid: 'Payée',
    partial: 'Paiement partiel',
    overdue: 'En retard',
    cancelled: 'Annulée'
  }
  return labels[status] || status
}

// Validation email
export const validateEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

// Calcul de la remise
export const calculateDiscount = (amount: number, discountPercent: number): number => {
  return amount * (discountPercent / 100)
}

// Application de la remise
export const applyDiscount = (amount: number, discountPercent: number): number => {
  return amount - calculateDiscount(amount, discountPercent)
}

// Formatage pourcentage
export const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`
}

// Conversion devise (mock pour l'instant)
export const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
  // TODO: Implémenter avec des taux de change réels
  const rates: Record<string, Record<string, number>> = {
    EUR: { USD: 1.10, GBP: 0.86 },
    USD: { EUR: 0.91, GBP: 0.78 },
    GBP: { EUR: 1.16, USD: 1.28 }
  }
  
  if (from === to) return amount
  
  const rate = rates[from]?.[to] || 1
  return amount * rate
}