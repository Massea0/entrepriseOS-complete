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
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Edit,
  Eye,
  Trash,
  ShoppingCart,
  ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  supplier: string;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  lastRestocked: Date;
  movements: {
    in: number;
    out: number;
  };
}

// Données de démo
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'LAPTOP-001',
    name: 'Dell Latitude 5520',
    description: 'Ordinateur portable professionnel 15.6"',
    category: 'Informatique',
    unitPrice: 1299,
    costPrice: 950,
    stockQuantity: 45,
    minStockLevel: 10,
    maxStockLevel: 100,
    reorderPoint: 20,
    supplier: 'Dell France',
    location: 'Entrepôt A - Rayon 3',
    status: 'in_stock',
    lastRestocked: new Date('2025-01-05'),
    movements: { in: 50, out: 5 }
  },
  {
    id: '2',
    sku: 'CHAIR-002',
    name: 'Chaise de bureau ergonomique',
    description: 'Chaise avec support lombaire ajustable',
    category: 'Mobilier',
    unitPrice: 349,
    costPrice: 220,
    stockQuantity: 8,
    minStockLevel: 15,
    maxStockLevel: 50,
    reorderPoint: 20,
    supplier: 'Mobilier Pro',
    location: 'Entrepôt B - Zone 2',
    status: 'low_stock',
    lastRestocked: new Date('2024-12-15'),
    movements: { in: 30, out: 22 }
  },
  {
    id: '3',
    sku: 'PHONE-003',
    name: 'iPhone 14 Pro',
    description: 'Smartphone Apple 256GB',
    category: 'Téléphonie',
    unitPrice: 1329,
    costPrice: 1100,
    stockQuantity: 0,
    minStockLevel: 5,
    maxStockLevel: 30,
    reorderPoint: 10,
    supplier: 'Apple Distribution',
    location: 'Entrepôt A - Coffre sécurisé',
    status: 'out_of_stock',
    lastRestocked: new Date('2024-12-01'),
    movements: { in: 20, out: 20 }
  },
  {
    id: '4',
    sku: 'PAPER-004',
    name: 'Papier A4 80g (500 feuilles)',
    description: 'Ramette de papier blanc standard',
    category: 'Fournitures',
    unitPrice: 5.99,
    costPrice: 3.50,
    stockQuantity: 250,
    minStockLevel: 50,
    maxStockLevel: 500,
    reorderPoint: 100,
    supplier: 'Office Supplies Co',
    location: 'Entrepôt C - Étagère 12',
    status: 'in_stock',
    lastRestocked: new Date('2025-01-02'),
    movements: { in: 300, out: 50 }
  },
  {
    id: '5',
    sku: 'MONITOR-005',
    name: 'Écran 27" 4K Dell',
    description: 'Moniteur UltraSharp U2720Q',
    category: 'Informatique',
    unitPrice: 549,
    costPrice: 420,
    stockQuantity: 23,
    minStockLevel: 10,
    maxStockLevel: 40,
    reorderPoint: 15,
    supplier: 'Dell France',
    location: 'Entrepôt A - Rayon 4',
    status: 'in_stock',
    lastRestocked: new Date('2024-12-28'),
    movements: { in: 25, out: 2 }
  },
  {
    id: '6',
    sku: 'DESK-006',
    name: 'Bureau ajustable électrique',
    description: 'Bureau assis-debout 160x80cm',
    category: 'Mobilier',
    unitPrice: 699,
    costPrice: 450,
    stockQuantity: 3,
    minStockLevel: 5,
    maxStockLevel: 20,
    reorderPoint: 8,
    supplier: 'Mobilier Pro',
    location: 'Entrepôt B - Zone 1',
    status: 'low_stock',
    lastRestocked: new Date('2024-11-20'),
    movements: { in: 10, out: 7 }
  }
];

export function ProductsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [products] = useState<Product[]>(MOCK_PRODUCTS);

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calcul des statistiques
  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.stockQuantity * p.unitPrice), 0),
    lowStock: products.filter(p => p.status === 'low_stock').length,
    outOfStock: products.filter(p => p.status === 'out_of_stock').length,
    avgTurnover: 85 // Simulation
  };

  const getStatusBadgeVariant = (status: Product['status']) => {
    switch (status) {
      case 'in_stock':
        return 'success';
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'destructive';
      case 'discontinued':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: Product['status']) => {
    switch (status) {
      case 'in_stock':
        return 'En stock';
      case 'low_stock':
        return 'Stock faible';
      case 'out_of_stock':
        return 'Rupture';
      case 'discontinued':
        return 'Discontinué';
      default:
        return status;
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

  const getStockLevel = (quantity: number, min: number, max: number) => {
    const percentage = ((quantity - min) / (max - min)) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProducts - stats.outOfStock} disponibles
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Valeur totale inventaire
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock + stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowStock} faibles, {stats.outOfStock} ruptures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rotation Stock</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTurnover}%</div>
            <p className="text-xs text-green-600">
              +5% vs mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des produits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produits</CardTitle>
              <CardDescription>Gérez votre inventaire de produits</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau produit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="Informatique">Informatique</SelectItem>
                <SelectItem value="Mobilier">Mobilier</SelectItem>
                <SelectItem value="Téléphonie">Téléphonie</SelectItem>
                <SelectItem value="Fournitures">Fournitures</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="in_stock">En stock</SelectItem>
                <SelectItem value="low_stock">Stock faible</SelectItem>
                <SelectItem value="out_of_stock">Rupture</SelectItem>
                <SelectItem value="discontinued">Discontinué</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU / Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-medium", getStockLevel(product.stockQuantity, product.minStockLevel, product.maxStockLevel))}>
                            {product.stockQuantity}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            / {product.maxStockLevel}
                          </span>
                        </div>
                        {product.stockQuantity <= product.reorderPoint && product.stockQuantity > 0 && (
                          <p className="text-xs text-yellow-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Réappro. nécessaire
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(product.unitPrice)}</p>
                        <p className="text-sm text-muted-foreground">
                          Coût: {formatCurrency(product.costPrice)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(product.stockQuantity * product.unitPrice)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(product.status)}>
                        {getStatusText(product.status)}
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
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Package className="mr-2 h-4 w-4" />
                            Ajuster stock
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Commander
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun produit trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}