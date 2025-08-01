import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Invoice, CreateInvoiceRequest, InvoiceStatus } from '../types/finance.types'
import { FinanceService } from '../services/finance.service'
import { useToast } from '@/hooks/use-toast'

interface UseInvoicesProps {
  initialStatus?: InvoiceStatus | 'all'
}

export function useInvoices({ initialStatus = 'all' }: UseInvoicesProps = {}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState(initialStatus)
  
  // Récupération des factures
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => FinanceService.getInvoices(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
  
  const invoices = data?.invoices || []
  
  // Filtrage des factures par statut
  const filteredInvoices = useMemo(() => {
    if (activeTab === 'all') return invoices
    
    switch (activeTab) {
      case 'draft':
        return invoices.filter(inv => inv.status === 'draft')
      case 'sent':
        return invoices.filter(inv => ['sent', 'viewed'].includes(inv.status))
      case 'unpaid':
        return invoices.filter(inv => ['sent', 'viewed', 'partial', 'overdue'].includes(inv.status))
      case 'paid':
        return invoices.filter(inv => inv.status === 'paid')
      case 'overdue':
        return invoices.filter(inv => inv.status === 'overdue')
      default:
        return invoices.filter(inv => inv.status === activeTab)
    }
  }, [invoices, activeTab])
  
  // Calcul des statistiques
  const stats = useMemo(() => {
    const totalAmount = invoices.reduce((sum, inv) => ({
      amount: sum.amount + inv.totalAmount.amount,
      currency: inv.totalAmount.currency
    }), { amount: 0, currency: 'EUR' })
    
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => ({
        amount: sum.amount + inv.totalAmount.amount,
        currency: inv.totalAmount.currency
      }), { amount: 0, currency: 'EUR' })
    
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => ({
        amount: sum.amount + (inv.remainingAmount?.amount || inv.totalAmount.amount),
        currency: inv.totalAmount.currency
      }), { amount: 0, currency: 'EUR' })
    
    return {
      totalAmount,
      paidAmount,
      overdueAmount,
      invoiceCount: {
        total: invoices.length,
        draft: invoices.filter(inv => inv.status === 'draft').length,
        sent: invoices.filter(inv => ['sent', 'viewed'].includes(inv.status)).length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        overdue: invoices.filter(inv => inv.status === 'overdue').length
      }
    }
  }, [invoices])
  
  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: (data: CreateInvoiceRequest) => FinanceService.createInvoice(data),
    onSuccess: (newInvoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast({
        title: 'Facture créée',
        description: `La facture ${newInvoice.number} a été créée avec succès.`
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de créer la facture: ${error.message}`,
        variant: 'destructive'
      })
    }
  })
  
  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
      FinanceService.updateInvoice(id, data),
    onSuccess: (updatedInvoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast({
        title: 'Facture mise à jour',
        description: `La facture ${updatedInvoice.number} a été mise à jour.`
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour la facture: ${error.message}`,
        variant: 'destructive'
      })
    }
  })
  
  const deleteInvoiceMutation = useMutation({
    mutationFn: (id: string) => FinanceService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast({
        title: 'Facture supprimée',
        description: 'La facture a été supprimée avec succès.'
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer la facture: ${error.message}`,
        variant: 'destructive'
      })
    }
  })
  
  const sendInvoiceMutation = useMutation({
    mutationFn: (id: string) => FinanceService.sendInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast({
        title: 'Facture envoyée',
        description: 'La facture a été envoyée au client.'
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Impossible d'envoyer la facture: ${error.message}`,
        variant: 'destructive'
      })
    }
  })
  
  const markAsPaidMutation = useMutation({
    mutationFn: (id: string) => FinanceService.markInvoiceAsPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast({
        title: 'Facture payée',
        description: 'La facture a été marquée comme payée.'
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de marquer la facture comme payée: ${error.message}`,
        variant: 'destructive'
      })
    }
  })
  
  // Actions
  const createInvoice = useCallback((data: CreateInvoiceRequest) => {
    createInvoiceMutation.mutate(data)
  }, [createInvoiceMutation])
  
  const updateInvoice = useCallback((id: string, data: Partial<Invoice>) => {
    updateInvoiceMutation.mutate({ id, data })
  }, [updateInvoiceMutation])
  
  const deleteInvoice = useCallback((id: string) => {
    deleteInvoiceMutation.mutate(id)
  }, [deleteInvoiceMutation])
  
  const sendInvoice = useCallback((id: string) => {
    sendInvoiceMutation.mutate(id)
  }, [sendInvoiceMutation])
  
  const markAsPaid = useCallback((id: string) => {
    markAsPaidMutation.mutate(id)
  }, [markAsPaidMutation])
  
  const generatePDF = useCallback(async (id: string) => {
    try {
      const pdfBlob = await FinanceService.generateInvoicePDF(id)
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      
      toast({
        title: 'PDF généré',
        description: 'Le PDF a été téléchargé avec succès.'
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le PDF.',
        variant: 'destructive'
      })
    }
  }, [toast])
  
  return {
    // Data
    invoices: filteredInvoices,
    allInvoices: invoices,
    isLoading,
    error,
    stats,
    
    // Filters
    activeTab,
    setActiveTab,
    
    // Actions
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
    markAsPaid,
    generatePDF,
    refetch,
    
    // Mutation states
    isCreating: createInvoiceMutation.isPending,
    isUpdating: updateInvoiceMutation.isPending,
    isDeleting: deleteInvoiceMutation.isPending,
    isSending: sendInvoiceMutation.isPending,
    isMarkingAsPaid: markAsPaidMutation.isPending
  }
}