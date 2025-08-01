// QuoteManagement.tsx
// Composant principal de gestion des devis

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Euro,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  AlertCircle,
  BarChart,
  RefreshCw
} from 'lucide-react'
import { useQuotes, useQuoteAIEnhancement } from '../../hooks'
import { QuoteList } from './QuoteList'
import { QuoteForm } from './QuoteForm'
import { QuoteFilters } from './QuoteFilters'
import { QuoteStatus } from '../../types'

export function QuoteManagement() {
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [selectedQuoteId, setSelectedQuoteId] = React.useState<string>()

  const {
    quotes,
    analytics,
    stats,
    filters,
    isLoading,
    isCreating,
    isSending,
    isConverting,
    createQuote,
    updateQuote,
    deleteQuote,
    sendQuote,
    convertToInvoice,
    updateStatus,
    setFilters,
    refetch
  } = useQuotes()

  const { enhance, isEnhancing } = useQuoteAIEnhancement(selectedQuoteId || '')

  // Statistiques
  const conversionRate = stats.conversionRate
  const conversionTrend = analytics?.monthlyTrend?.[0]?.conversionRate || 0
  const avgValue = analytics?.averageValue || 0
  const totalValue = stats.total > 0 ? quotes.reduce((sum, q) => sum + q.totalAmount, 0) : 0

  const handleQuoteClick = (quote: typeof quotes[0]) => {
    router.push(`/finance/quotes/${quote.id}`)
  }

  const handleEdit = (quoteId: string) => {
    router.push(`/finance/quotes/${quoteId}/edit`)
  }

  const handleEnhanceWithAI = async (quoteId: string) => {
    setSelectedQuoteId(quoteId)
    await enhance()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis actifs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.draft} brouillons, {stats.pendingResponse} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            {conversionRate >= conversionTrend ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <Progress value={conversionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur moyenne</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgValue)}</div>
            <p className="text-xs text-muted-foreground">
              par devis accepté
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total en cours</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.accepted} acceptés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions et filtres */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <QuoteFilters
          filters={filters}
          onFiltersChange={setFilters}
          className="flex-1"
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>

          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
          </Button>
        </div>
      </div>

      {/* Alertes */}
      {stats.expired > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous avez {stats.expired} devis expirés. Pensez à les relancer ou les clôturer.
          </AlertDescription>
        </Alert>
      )}

      {/* Onglets */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Tous
            <Badge variant="secondary" className="ml-2">
              {stats.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="draft">
            Brouillons
            {stats.draft > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.draft}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            En attente
            {stats.pendingResponse > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.pendingResponse}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Acceptés
            {stats.accepted > 0 && (
              <Badge variant="success" className="ml-2">
                {stats.accepted}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <QuoteList
            quotes={quotes}
            isLoading={isLoading}
            onQuoteClick={handleQuoteClick}
            onSend={sendQuote}
            onEdit={handleEdit}
            onConvertToInvoice={convertToInvoice}
            onUpdateStatus={updateStatus}
            onDelete={deleteQuote}
            onEnhanceWithAI={handleEnhanceWithAI}
          />
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <QuoteList
            quotes={quotes.filter(q => q.status === QuoteStatus.DRAFT)}
            isLoading={isLoading}
            onQuoteClick={handleQuoteClick}
            onSend={sendQuote}
            onEdit={handleEdit}
            onDelete={deleteQuote}
            onEnhanceWithAI={handleEnhanceWithAI}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <QuoteList
            quotes={quotes.filter(q => 
              q.status === QuoteStatus.SENT || q.status === QuoteStatus.VIEWED
            )}
            isLoading={isLoading}
            onQuoteClick={handleQuoteClick}
            onUpdateStatus={updateStatus}
            onEnhanceWithAI={handleEnhanceWithAI}
          />
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          <QuoteList
            quotes={quotes.filter(q => q.status === QuoteStatus.ACCEPTED)}
            isLoading={isLoading}
            onQuoteClick={handleQuoteClick}
            onConvertToInvoice={convertToInvoice}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog de création */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau devis</DialogTitle>
            <DialogDescription>
              Créez un nouveau devis manuellement ou utilisez l'IA pour le générer
            </DialogDescription>
          </DialogHeader>

          <QuoteForm
            onSubmit={async (data) => {
              await createQuote(data)
              setIsCreateDialogOpen(false)
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}