import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  FileText,
  Send,
  Copy,
  RefreshCw,
  Eye,
  Edit,
  Trash,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Quote {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  date: Date;
  validUntil: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

// Données de démo
const MOCK_QUOTES: Quote[] = [
  {
    id: '1',
    number: 'DEV-2025-001',
    clientName: 'TechCorp Solutions',
    clientEmail: 'contact@techcorp.fr',
    date: new Date('2025-01-05'),
    validUntil: new Date('2025-02-05'),
    status: 'sent',
    items: [
      { description: 'Développement application web', quantity: 1, unitPrice: 15000, total: 15000 },
      { description: 'Formation équipe', quantity: 3, unitPrice: 800, total: 2400 },
    ],
    subtotal: 17400,
    tax: 3480,
    total: 20880,
  },
  {
    id: '2',
    number: 'DEV-2025-002',
    clientName: 'Innovate SAS',
    clientEmail: 'projet@innovate.fr',
    date: new Date('2025-01-08'),
    validUntil: new Date('2025-02-08'),
    status: 'draft',
    items: [
      { description: 'Audit système existant', quantity: 1, unitPrice: 3000, total: 3000 },
      { description: 'Migration base de données', quantity: 1, unitPrice: 5000, total: 5000 },
      { description: 'Support post-migration (jours)', quantity: 5, unitPrice: 600, total: 3000 },
    ],
    subtotal: 11000,
    tax: 2200,
    total: 13200,
  },
  {
    id: '3',
    number: 'DEV-2024-098',
    clientName: 'Retail Pro',
    clientEmail: 'direction@retailpro.com',
    date: new Date('2024-12-15'),
    validUntil: new Date('2025-01-15'),
    status: 'accepted',
    items: [
      { description: 'Module e-commerce', quantity: 1, unitPrice: 8000, total: 8000 },
      { description: 'Intégration paiement', quantity: 1, unitPrice: 2000, total: 2000 },
    ],
    subtotal: 10000,
    tax: 2000,
    total: 12000,
  },
  {
    id: '4',
    number: 'DEV-2024-095',
    clientName: 'Finance Plus',
    clientEmail: 'it@financeplus.fr',
    date: new Date('2024-11-20'),
    validUntil: new Date('2024-12-20'),
    status: 'expired',
    items: [
      { description: 'API REST développement', quantity: 1, unitPrice: 7000, total: 7000 },
    ],
    subtotal: 7000,
    tax: 1400,
    total: 8400,
  },
];

export function QuotesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [quotes] = useState<Quote[]>(MOCK_QUOTES);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // Filtrage des devis
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calcul des statistiques
  const stats = {
    total: quotes.length,
    sent: quotes.filter(q => q.status === 'sent').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    totalValue: quotes.reduce((sum, q) => sum + q.total, 0),
    acceptanceRate: Math.round((quotes.filter(q => q.status === 'accepted').length / quotes.filter(q => ['sent', 'accepted', 'rejected'].includes(q.status)).length) * 100) || 0
  };

  const getStatusBadgeVariant = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'sent':
        return 'default';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'expired':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-3 w-3" />;
      case 'expired':
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR');
  };

  const getDaysUntilExpiry = (validUntil: Date) => {
    const now = new Date();
    const diff = validUntil.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleConvertToInvoice = (quote: Quote) => {
    setSelectedQuote(quote);
    setConvertDialogOpen(true);
  };

  const confirmConvertToInvoice = () => {
    if (selectedQuote) {
      toast.success(`Devis ${selectedQuote.number} converti en facture avec succès`);
      setConvertDialogOpen(false);
      setSelectedQuote(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.sent} en attente
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis acceptés</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
            <p className="text-xs text-green-600">
              Taux d'acceptation : {stats.acceptanceRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Tous les devis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion moyenne</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 jours</div>
            <p className="text-xs text-muted-foreground">
              Devis → Facture
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des devis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Devis</CardTitle>
              <CardDescription>Gérez vos devis et propositions commerciales</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau devis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un devis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="sent">Envoyé</SelectItem>
                <SelectItem value="accepted">Accepté</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Validité</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => {
                  const daysUntilExpiry = getDaysUntilExpiry(quote.validUntil);
                  const isExpiringSoon = quote.status === 'sent' && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                  
                  return (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.clientName}</p>
                          <p className="text-sm text-muted-foreground">{quote.clientEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(quote.date)}</TableCell>
                      <TableCell>
                        <div>
                          <p>{formatDate(quote.validUntil)}</p>
                          {quote.status === 'sent' && (
                            <p className={`text-xs ${isExpiringSoon ? 'text-orange-600' : 'text-muted-foreground'}`}>
                              {daysUntilExpiry > 0 ? `${daysUntilExpiry} jours restants` : 'Expiré'}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(quote.total)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(quote.status)} className="gap-1">
                          {getStatusIcon(quote.status)}
                          {quote.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir le devis
                            </DropdownMenuItem>
                            {quote.status === 'draft' && (
                              <>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Send className="mr-2 h-4 w-4" />
                                  Envoyer au client
                                </DropdownMenuItem>
                              </>
                            )}
                            {quote.status === 'sent' && (
                              <DropdownMenuItem>
                                <Send className="mr-2 h-4 w-4" />
                                Renvoyer
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Dupliquer
                            </DropdownMenuItem>
                            {quote.status === 'accepted' && (
                              <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Convertir en facture
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredQuotes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun devis trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de conversion en facture */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convertir en facture</DialogTitle>
            <DialogDescription>
              Voulez-vous convertir le devis {selectedQuote?.number} en facture ?
              Cette action créera une nouvelle facture avec les mêmes informations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmConvertToInvoice}>
              Convertir en facture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}