'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trophy,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { leadScoringService } from '../services/lead-scoring.service'
import type { LeadScore } from '../services/lead-scoring.service'

export function LeadScoringDashboard() {
  const [leads, setLeads] = useState<LeadScore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<string | null>(null)

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    setIsLoading(true)
    try {
      // Mock data for demo
      const mockLeads: LeadScore[] = [
        {
          leadId: '1',
          score: 92,
          grade: 'A',
          category: 'hot',
          factors: {
            demographic: 85,
            firmographic: 95,
            behavioral: 90,
            engagement: 98
          },
          insights: [
            'Forte activité sur le site web',
            'Profil correspond au client idéal',
            'Décideur avec budget confirmé'
          ],
          nextBestActions: [
            { action: 'Appeler dans les 24h', priority: 'high', expectedImpact: 85 },
            { action: 'Envoyer proposition personnalisée', priority: 'high', expectedImpact: 75 }
          ],
          conversionProbability: 0.85,
          estimatedDealSize: 50000,
          recommendedAssignee: {
            id: '1',
            name: 'Marie Dupont',
            reason: 'Expert dans ce secteur'
          }
        },
        {
          leadId: '2',
          score: 78,
          grade: 'B',
          category: 'warm',
          factors: {
            demographic: 70,
            firmographic: 80,
            behavioral: 75,
            engagement: 85
          },
          insights: [
            'Intérêt croissant',
            'A téléchargé 3 livres blancs',
            'Entreprise en croissance'
          ],
          nextBestActions: [
            { action: 'Inviter au webinar', priority: 'medium', expectedImpact: 60 },
            { action: 'Nurturing email sequence', priority: 'medium', expectedImpact: 55 }
          ],
          conversionProbability: 0.65,
          estimatedDealSize: 30000,
          recommendedAssignee: {
            id: '2',
            name: 'Pierre Martin',
            reason: 'Disponible et expérimenté'
          }
        }
      ]
      setLeads(mockLeads)
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getGradeBadge = (grade: string) => {
    const colors = {
      A: 'bg-green-500',
      B: 'bg-blue-500',
      C: 'bg-yellow-500',
      D: 'bg-orange-500',
      F: 'bg-red-500'
    }
    return (
      <Badge className={`${colors[grade as keyof typeof colors]} text-white`}>
        Grade {grade}
      </Badge>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hot':
        return <Trophy className="h-5 w-5 text-red-500" />
      case 'warm':
        return <Target className="h-5 w-5 text-orange-500" />
      default:
        return <Users className="h-5 w-5 text-blue-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">+12% ce mois</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {leads.filter(l => l.category === 'hot').length}
            </div>
            <p className="text-xs text-muted-foreground">Prêts à convertir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length)}
            </div>
            <Progress 
              value={Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length)} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Valeur Potentielle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0
              }).format(leads.reduce((acc, l) => acc + l.estimatedDealSize, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Total estimé</p>
          </CardContent>
        </Card>
      </div>

      {/* Lead List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tous les leads</TabsTrigger>
          <TabsTrigger value="hot">Hot ({leads.filter(l => l.category === 'hot').length})</TabsTrigger>
          <TabsTrigger value="warm">Warm ({leads.filter(l => l.category === 'warm').length})</TabsTrigger>
          <TabsTrigger value="cold">Cold ({leads.filter(l => l.category === 'cold').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {leads.map((lead) => (
            <Card key={lead.leadId} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(lead.category)}
                      <h3 className="font-semibold">Lead #{lead.leadId}</h3>
                      {getGradeBadge(lead.grade)}
                      <Badge variant="outline">{lead.category}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Score Global</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{lead.score}</span>
                          <Progress value={lead.score} className="flex-1" />
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Probabilité conversion</p>
                        <p className="text-lg font-semibold">
                          {(lead.conversionProbability * 100).toFixed(0)}%
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Valeur estimée</p>
                        <p className="text-lg font-semibold">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0
                          }).format(lead.estimatedDealSize)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Assigné à</p>
                        <p className="text-lg font-semibold">{lead.recommendedAssignee.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        {lead.insights.slice(0, 2).map((insight, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {insight}
                          </Badge>
                        ))}
                      </div>
                      
                      {lead.nextBestActions[0] && (
                        <div className="flex items-center gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{lead.nextBestActions[0].action}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button size="sm" variant="ghost">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="hot" className="space-y-4">
          {leads.filter(l => l.category === 'hot').map((lead) => (
            <Card key={lead.leadId}>
              <CardContent className="p-6">
                {/* Same content as above but filtered */}
                <div className="font-semibold">Hot Lead #{lead.leadId}</div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}