import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, Warehouse, TruckIcon, AlertTriangle } from 'lucide-react';

export default function InventoryDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventaire</h1>
          <p className="text-muted-foreground">Gérez vos stocks et entrepôts</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau produit
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle commande
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250</div>
            <p className="text-xs text-muted-foreground">+45 cette semaine</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur stock</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€342,500</div>
            <p className="text-xs text-muted-foreground">3 entrepôts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes en cours</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">12 en livraison</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Produits à réapprovisionner</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="warehouses">Entrepôts</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Catalogue produits</CardTitle>
              <CardDescription>Gérez votre catalogue de produits</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Liste des produits à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entrepôts</CardTitle>
              <CardDescription>Gérez vos entrepôts et emplacements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Gestion des entrepôts à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mouvements de stock</CardTitle>
              <CardDescription>Historique des entrées et sorties</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Mouvements de stock à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commandes fournisseurs</CardTitle>
              <CardDescription>Gérez vos commandes d'approvisionnement</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Gestion des commandes à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertes de stock</CardTitle>
              <CardDescription>Produits en rupture ou stock faible</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Système d'alertes à implémenter</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}