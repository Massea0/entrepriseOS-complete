import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  Plus, 
  Sparkles,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PricingService } from '../../services/pricing.service'

interface Product {
  id: string
  name: string
  price: number
  margin: number
}

interface Bundle {
  id: string
  name: string
  products: string[]
  originalPrice: number
  bundlePrice: number
  discount: number
  attractiveness: number
  projectedSales: number
}

interface BundleOptimizerProps {
  products: Product[]
}

export function BundleOptimizer({ products }: BundleOptimizerProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [generatedBundles, setGeneratedBundles] = useState<Bundle[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleOptimizeBundles = async () => {
    setIsOptimizing(true)
    try {
      const result = await PricingService.optimizeBundlePricing({
        products: selectedProducts.length > 0 ? selectedProducts : products.map(p => p.id),
        targetDiscount: 15,
        maxBundleSize: 3
      })
      
      // Générer des bundles mock
      const bundles: Bundle[] = [
        {
          id: 'bundle-1',
          name: 'Pack Essentiel',
          products: products.slice(0, 2).map(p => p.id),
          originalPrice: products.slice(0, 2).reduce((sum, p) => sum + p.price, 0),
          bundlePrice: products.slice(0, 2).reduce((sum, p) => sum + p.price, 0) * 0.85,
          discount: 15,
          attractiveness: 85,
          projectedSales: 150
        },
        {
          id: 'bundle-2',
          name: 'Pack Premium',
          products: products.slice(0, 3).map(p => p.id),
          originalPrice: products.slice(0, 3).reduce((sum, p) => sum + p.price, 0),
          bundlePrice: products.slice(0, 3).reduce((sum, p) => sum + p.price, 0) * 0.8,
          discount: 20,
          attractiveness: 92,
          projectedSales: 120
        },
        {
          id: 'bundle-3',
          name: 'Pack Complet',
          products: products.slice(0, 4).map(p => p.id),
          originalPrice: products.slice(0, 4).reduce((sum, p) => sum + p.price, 0),
          bundlePrice: products.slice(0, 4).reduce((sum, p) => sum + p.price, 0) * 0.75,
          discount: 25,
          attractiveness: 88,
          projectedSales: 80
        }
      ]
      
      setGeneratedBundles(bundles)
    } catch (error) {
      console.error('Error optimizing bundles:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id))
  const totalOriginalPrice = selectedProductsData.reduce((sum, p) => sum + p.price, 0)

  const getAttractivenessColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getAttractivenessLabel = (score: number) => {
    if (score >= 90) return { text: 'Très attractif', color: 'bg-green-100 text-green-800' }
    if (score >= 70) return { text: 'Attractif', color: 'bg-blue-100 text-blue-800' }
    if (score >= 50) return { text: 'Moyen', color: 'bg-orange-100 text-orange-800' }
    return { text: 'Peu attractif', color: 'bg-red-100 text-red-800' }
  }

  return (
    <div className="space-y-6">
      {/* Product selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sélection des Produits</CardTitle>
              <CardDescription>
                Choisissez les produits à inclure dans l'optimisation des bundles
              </CardDescription>
            </div>
            <Button 
              onClick={handleOptimizeBundles}
              disabled={isOptimizing}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isOptimizing ? 'Optimisation...' : 'Générer des bundles'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div 
                key={product.id}
                className={cn(
                  'flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors',
                  selectedProducts.includes(product.id) ? 'bg-primary/5 border-primary' : 'hover:bg-muted'
                )}
                onClick={() => handleProductToggle(product.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleProductToggle(product.id)}
                  />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(product.price)} • Marge {product.margin}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedProducts.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''} sélectionné{selectedProducts.length > 1 ? 's' : ''}
                </span>
                <span className="text-sm">
                  Prix total: {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(totalOriginalPrice)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated bundles */}
      {generatedBundles.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Bundles Générés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{generatedBundles.length}</div>
                <p className="text-sm text-muted-foreground">
                  Combinaisons optimales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Ventes Projetées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {generatedBundles.reduce((sum, b) => sum + b.projectedSales, 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  unités/mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Revenu Additionnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0
                  }).format(
                    generatedBundles.reduce((sum, b) => sum + b.bundlePrice * b.projectedSales, 0) * 0.15
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  estimé/mois
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {generatedBundles.map((bundle) => {
              const bundleProducts = products.filter(p => bundle.products.includes(p.id))
              const attractivenessLabel = getAttractivenessLabel(bundle.attractiveness)
              
              return (
                <Card key={bundle.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          {bundle.name}
                        </CardTitle>
                        <CardDescription>
                          {bundleProducts.length} produits • {bundle.discount}% de réduction
                        </CardDescription>
                      </div>
                      <Badge className={attractivenessLabel.color}>
                        {attractivenessLabel.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Products in bundle */}
                      <div className="space-y-2">
                        {bundleProducts.map(product => (
                          <div key={product.id} className="flex items-center justify-between text-sm">
                            <span>{product.name}</span>
                            <span className="text-muted-foreground">
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              }).format(product.price)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Pricing */}
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Prix normal</span>
                          <span className="line-through text-muted-foreground">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format(bundle.originalPrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Prix bundle</span>
                          <span className="text-lg font-bold text-green-600">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format(bundle.bundlePrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Économie</span>
                          <span className="text-green-600 font-medium">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format(bundle.originalPrice - bundle.bundlePrice)}
                          </span>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Attractivité</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={bundle.attractiveness} className="flex-1" />
                            <span className={cn('text-sm font-medium', getAttractivenessColor(bundle.attractiveness))}>
                              {bundle.attractiveness}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Ventes estimées</p>
                          <p className="font-medium flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {bundle.projectedSales}/mois
                          </p>
                        </div>
                      </div>

                      {/* Action */}
                      <Button className="w-full" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Créer ce bundle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}