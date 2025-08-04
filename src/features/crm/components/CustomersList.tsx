import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building,
  Eye,
  Edit,
  Trash,
  TrendingUp,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'prospect' | 'lead';
  industry: string;
  revenue: number;
  deals: number;
  lastContact: Date;
  assignedTo: string;
  avatar?: string;
}

// Données de démo
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Sophie Martin',
    email: 'sophie.martin@techcorp.fr',
    phone: '+33 6 12 34 56 78',
    company: 'TechCorp Solutions',
    status: 'active',
    industry: 'Technologie',
    revenue: 125000,
    deals: 3,
    lastContact: new Date('2025-01-07'),
    assignedTo: 'Jean Dupont'
  },
  {
    id: '2',
    name: 'Pierre Dubois',
    email: 'p.dubois@innovate.fr',
    phone: '+33 6 98 76 54 32',
    company: 'Innovate SAS',
    status: 'lead',
    industry: 'Services',
    revenue: 75000,
    deals: 2,
    lastContact: new Date('2025-01-05'),
    assignedTo: 'Marie Laurent'
  },
  {
    id: '3',
    name: 'Marie Lefebvre',
    email: 'marie@retail-pro.com',
    phone: '+33 7 23 45 67 89',
    company: 'Retail Pro',
    status: 'active',
    industry: 'Commerce',
    revenue: 200000,
    deals: 5,
    lastContact: new Date('2025-01-06'),
    assignedTo: 'Jean Dupont'
  },
  {
    id: '4',
    name: 'Thomas Bernard',
    email: 'thomas.bernard@finance-plus.fr',
    phone: '+33 6 45 67 89 01',
    company: 'Finance Plus',
    status: 'prospect',
    industry: 'Finance',
    revenue: 0,
    deals: 0,
    lastContact: new Date('2025-01-02'),
    assignedTo: 'Sophie Chen'
  },
  {
    id: '5',
    name: 'Emma Rousseau',
    email: 'emma@healthtech.fr',
    phone: '+33 7 89 01 23 45',
    company: 'HealthTech Innovation',
    status: 'active',
    industry: 'Santé',
    revenue: 300000,
    deals: 7,
    lastContact: new Date('2025-01-08'),
    assignedTo: 'Marie Laurent'
  },
  {
    id: '6',
    name: 'Nicolas Petit',
    email: 'n.petit@logistique-express.com',
    phone: '+33 6 56 78 90 12',
    company: 'Logistique Express',
    status: 'inactive',
    industry: 'Logistique',
    revenue: 50000,
    deals: 1,
    lastContact: new Date('2024-12-15'),
    assignedTo: 'Jean Dupont'
  }
];

export function CustomersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [customers] = useState<Customer[]>(MOCK_CUSTOMERS);

  // Filtrage des clients
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || customer.industry === industryFilter;

    return matchesSearch && matchesStatus && matchesIndustry;
  });

  // Calcul des statistiques
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.revenue, 0),
    totalDeals: customers.reduce((sum, c) => sum + c.deals, 0)
  };

  const getStatusBadgeVariant = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'lead':
        return 'secondary';
      case 'prospect':
        return 'outline';
      case 'inactive':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} actifs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Depuis le début
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Actifs</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeals}</div>
            <p className="text-xs text-muted-foreground">
              En cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-green-600">
              +12% vs mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des clients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clients</CardTitle>
              <CardDescription>Gérez vos clients et prospects</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Industrie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les industries</SelectItem>
                <SelectItem value="Technologie">Technologie</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
                <SelectItem value="Commerce">Commerce</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Santé">Santé</SelectItem>
                <SelectItem value="Logistique">Logistique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Société</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Dernier contact</TableHead>
                  <TableHead>Assigné à</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={customer.avatar} />
                          <AvatarFallback>
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.company}</p>
                        <p className="text-sm text-muted-foreground">{customer.industry}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(customer.status)}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(customer.revenue)}</p>
                        <p className="text-sm text-muted-foreground">{customer.deals} deals</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(customer.lastContact)}</TableCell>
                    <TableCell>{customer.assignedTo}</TableCell>
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
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Appeler
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Envoyer un email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun client trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}