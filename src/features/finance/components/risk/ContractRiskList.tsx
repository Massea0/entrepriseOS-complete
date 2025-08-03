import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  ChevronRight,
  FileText,
  Calendar
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Contract {
  id: string
  name: string
  clientName: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  factors: number
  lastAnalyzed: string
}

interface ContractRiskListProps {
  contracts: Contract[]
  onSelectContract: (contractId: string) => void
  selectedContract: string | null
}

export function ContractRiskList({ 
  contracts, 
  onSelectContract, 
  selectedContract 
}: ContractRiskListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score')

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterLevel === 'all' || contract.riskLevel === filterLevel
    
    return matchesSearch && matchesFilter
  })

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    if (sortBy === 'score') {
      return b.riskScore - a.riskScore
    } else {
      return new Date(b.lastAnalyzed).getTime() - new Date(a.lastAnalyzed).getTime()
    }
  })

  const getRiskBadge = (level: string) => {
    const variants: Record<string, any> = {
      low: { variant: 'outline', className: 'border-green-500 text-green-700' },
      medium: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      high: { variant: 'default', className: 'bg-orange-100 text-orange-800' },
      critical: { variant: 'destructive', className: '' }
    }
    
    const config = variants[level] || variants.low
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {level === 'low' && 'Faible'}
        {level === 'medium' && 'Modéré'}
        {level === 'high' && 'Élevé'}
        {level === 'critical' && 'Critique'}
      </Badge>
    )
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600 font-bold'
    if (score >= 50) return 'text-orange-600 font-semibold'
    if (score >= 30) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contrats par Niveau de Risque</CardTitle>
            <CardDescription>
              Cliquez sur un contrat pour voir l'analyse détaillée
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {sortedContracts.length} contrat{sortedContracts.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un contrat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
              <SelectItem value="high">Élevé</SelectItem>
              <SelectItem value="medium">Modéré</SelectItem>
              <SelectItem value="low">Faible</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Par score</SelectItem>
              <SelectItem value="date">Par date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contracts table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrat</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Niveau</TableHead>
                <TableHead className="text-center">Facteurs</TableHead>
                <TableHead>Dernière analyse</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun contrat trouvé
                  </TableCell>
                </TableRow>
              ) : (
                sortedContracts.map((contract) => (
                  <TableRow 
                    key={contract.id}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      selectedContract === contract.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => onSelectContract(contract.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {contract.name}
                      </div>
                    </TableCell>
                    <TableCell>{contract.clientName}</TableCell>
                    <TableCell className="text-center">
                      <span className={getRiskScoreColor(contract.riskScore)}>
                        {contract.riskScore}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {getRiskBadge(contract.riskLevel)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{contract.factors}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(contract.lastAnalyzed), { 
                          addSuffix: true,
                          locale: fr 
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectContract(contract.id)
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Affichage de {sortedContracts.length} sur {contracts.length} contrats
          </div>
          {sortedContracts.filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high').length > 0 && (
            <div className="text-orange-600 font-medium">
              {sortedContracts.filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high').length} 
              {' '}contrats à surveiller
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}