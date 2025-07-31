import React, { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Tag,
  BarChart3,
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Modal } from '@/components/ui/modal'
import { Spinner } from '@/components/ui/spinner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

import { InventoryService } from '../../services/inventory.service'
import { Product } from '../../types/inventory.types'
import {
  ProductCatalogProps,
  ProductFilters,
  ProductFormData
} from './ProductCatalog.types'
import { ProductCard } from './components/ProductCard'
import { ProductForm } from './components/ProductForm'
import { ProductDetails } from './components/ProductDetails'
import { ProductImport } from './components/ProductImport'
import { ProductFiltersPanel } from './components/ProductFiltersPanel'
import { BulkActions } from './components/BulkActions'
import { ProductStats } from './components/ProductStats'

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products: productsProp,
  categories: categoriesProp,
  suppliers: suppliersProp,
  onProductCreate,
  onProductUpdate,
  onProductDelete,
  onProductsImport,
  onProductsExport,
  onBulkUpdate,
  onBulkDelete,
  showAdvancedFilters = true,
  showBulkActions = true,
  viewMode: viewModeProp = 'grid',
  isLoading: isLoadingProp = false,
  className
}) => {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(viewModeProp)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [selectMode, setSelectMode] = useState(false)

  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    status: 'all',
    stockStatus: 'all',
    trackingType: 'all'
  })

  // Fetch data
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => InventoryService.getProducts(filters),
    enabled: !productsProp
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => InventoryService.getProductCategories(),
    enabled: !categoriesProp
  })

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => InventoryService.getSuppliers(),
    enabled: !suppliersProp
  })

  const { data: stockLevels } = useQuery({
    queryKey: ['stock-levels'],
    queryFn: () => InventoryService.getStockLevels()
  })

  const products = productsProp || productsData?.data || []
  const categories = categoriesProp || categoriesData?.data || []
  const suppliers = suppliersProp || suppliersData?.data || []
  const isLoading = isLoadingProp || isLoadingProducts

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Product>) =>
      onProductCreate ? onProductCreate(data) : InventoryService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produit créé avec succès')
      setShowCreateModal(false)
    },
    onError: () => {
      toast.error('Erreur lors de la création du produit')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      onProductUpdate ? onProductUpdate(id, data) : InventoryService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produit mis à jour avec succès')
      setShowCreateModal(false)
      setProductToEdit(null)
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du produit')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      onProductDelete ? onProductDelete(id) : InventoryService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produit supprimé avec succès')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du produit')
    }
  })

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: Partial<Product> }) =>
      onBulkUpdate ? onBulkUpdate(ids, data) : InventoryService.bulkUpdateProducts(ids, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produits mis à jour avec succès')
      setSelectedProducts(new Set())
      setSelectMode(false)
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour des produits')
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      onBulkDelete ? onBulkDelete(ids) : InventoryService.bulkDeleteProducts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produits supprimés avec succès')
      setSelectedProducts(new Set())
      setSelectMode(false)
    },
    onError: () => {
      toast.error('Erreur lors de la suppression des produits')
    }
  })

  // Handlers
  const handleProductSelect = useCallback((product: Product) => {
    if (selectMode) {
      setSelectedProducts(prev => {
        const newSet = new Set(prev)
        if (newSet.has(product.id)) {
          newSet.delete(product.id)
        } else {
          newSet.add(product.id)
        }
        return newSet
      })
    } else {
      setSelectedProduct(product)
      setShowDetailsModal(true)
    }
  }, [selectMode])

  const handleProductEdit = useCallback((product: Product) => {
    setProductToEdit(product)
    setShowCreateModal(true)
  }, [])

  const handleProductDelete = useCallback((product: Product) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit ${product.name} ?`)) {
      deleteMutation.mutate(product.id)
    }
  }, [deleteMutation])

  const handleCreateSubmit = useCallback((data: ProductFormData) => {
    if (productToEdit) {
      updateMutation.mutate({ id: productToEdit.id, data: data as Partial<Product> })
    } else {
      createMutation.mutate(data as Partial<Product>)
    }
  }, [createMutation, updateMutation, productToEdit])

  const handleImport = useCallback(async (products: Partial<Product>[]) => {
    if (onProductsImport) {
      await onProductsImport(products)
    } else {
      await InventoryService.importProducts(products)
    }
    queryClient.invalidateQueries({ queryKey: ['products'] })
    toast.success(`${products.length} produits importés avec succès`)
    setShowImportModal(false)
  }, [onProductsImport, queryClient])

  const handleExport = useCallback(async () => {
    try {
      const selectedIds = Array.from(selectedProducts)
      if (onProductsExport) {
        await onProductsExport(selectedIds)
      } else {
        const data = await InventoryService.exportProducts(selectedIds)
        // Handle download
        const blob = new Blob([data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `products-${new Date().toISOString()}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
      toast.success('Export réussi')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }, [selectedProducts, onProductsExport])

  const handleSelectAll = useCallback(() => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)))
    }
  }, [selectedProducts, filteredProducts])

  const handleBulkUpdate = useCallback((data: Partial<Product>) => {
    const selectedIds = Array.from(selectedProducts)
    bulkUpdateMutation.mutate({ ids: selectedIds, data })
  }, [selectedProducts, bulkUpdateMutation])

  const handleBulkDelete = useCallback(() => {
    const selectedIds = Array.from(selectedProducts)
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} produits ?`)) {
      bulkDeleteMutation.mutate(selectedIds)
    }
  }, [selectedProducts, bulkDeleteMutation])

  // Filtered products with stock info
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.barcode?.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search)
      )
    }

    // Category filter
    if (filters.categoryId) {
      filtered = filtered.filter(product => product.categoryId === filters.categoryId)
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(product => product.status === filters.status)
    }

    // Stock status filter
    if (filters.stockStatus && filters.stockStatus !== 'all' && stockLevels?.data) {
      filtered = filtered.filter(product => {
        const stock = stockLevels.data.find((s: any) => s.productId === product.id)
        const totalStock = stock?.quantity || 0
        const minStock = product.minStockLevel || 0
        
        switch (filters.stockStatus) {
          case 'in_stock':
            return totalStock > minStock
          case 'low_stock':
            return totalStock > 0 && totalStock <= minStock
          case 'out_of_stock':
            return totalStock === 0
          default:
            return true
        }
      })
    }

    // Price filter
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(product => 
        (product.sellingPrice?.amount || 0) >= filters.minPrice!
      )
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(product => 
        (product.sellingPrice?.amount || 0) <= filters.maxPrice!
      )
    }

    // Tracking type filter
    if (filters.trackingType && filters.trackingType !== 'all') {
      filtered = filtered.filter(product => product.trackingType === filters.trackingType)
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(product =>
        filters.tags!.some(tag => product.tags?.includes(tag))
      )
    }

    return filtered
  }, [products, filters, stockLevels])

  // Calculate stats
  const stats = useMemo(() => {
    const activeProducts = products.filter(p => p.status === 'active').length
    const totalValue = products.reduce((sum, p) => {
      const stock = stockLevels?.data?.find((s: any) => s.productId === p.id)
      const quantity = stock?.quantity || 0
      const value = quantity * (p.averageCost?.amount || 0)
      return sum + value
    }, 0)

    const outOfStock = stockLevels?.data?.filter((s: any) => s.quantity === 0).length || 0
    const lowStock = stockLevels?.data?.filter((s: any) => {
      const product = products.find(p => p.id === s.productId)
      return s.quantity > 0 && s.quantity <= (product?.minStockLevel || 0)
    }).length || 0

    return {
      totalProducts: products.length,
      activeProducts,
      totalValue,
      outOfStock,
      lowStock,
      categories: new Set(products.map(p => p.categoryId)).size
    }
  }, [products, stockLevels])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Catalogue Produits
          </h2>
          <p className="text-muted-foreground mt-1">
            Gérez votre catalogue de produits et inventaire
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectMode && selectedProducts.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter ({selectedProducts.size})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button
            onClick={() => {
              setProductToEdit(null)
              setShowCreateModal(true)
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ProductStats stats={stats} />

      {/* Filters & Actions Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, SKU, code-barres..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showFiltersPanel ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {Object.keys(filters).filter(k => k !== 'search' && filters[k as keyof ProductFilters] !== 'all' && filters[k as keyof ProductFilters]).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(filters).filter(k => k !== 'search' && filters[k as keyof ProductFilters] !== 'all' && filters[k as keyof ProductFilters]).length}
                </Badge>
              )}
            </Button>
            {showBulkActions && (
              <Button
                variant={selectMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectMode(!selectMode)
                  setSelectedProducts(new Set())
                }}
              >
                {selectMode ? (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Mode sélection
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Sélectionner
                  </>
                )}
              </Button>
            )}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFiltersPanel && showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t">
                <ProductFiltersPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={categories}
                  suppliers={suppliers}
                  onReset={() => setFilters({ search: '', status: 'all', stockStatus: 'all', trackingType: 'all' })}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Bulk Actions */}
      {selectMode && selectedProducts.size > 0 && (
        <BulkActions
          selectedProducts={products.filter(p => selectedProducts.has(p.id))}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedProducts(new Set())}
          categories={categories}
        />
      )}

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
          <p className="text-muted-foreground mb-4">
            {filters.search || Object.keys(filters).some(k => filters[k as keyof ProductFilters] !== 'all')
              ? 'Aucun produit ne correspond à vos critères de recherche'
              : 'Commencez par ajouter votre premier produit'}
          </p>
          {!filters.search && Object.keys(filters).every(k => filters[k as keyof ProductFilters] === 'all') && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          )}
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-4'
        )}>
          {/* Select All for list view */}
          {viewMode === 'list' && selectMode && (
            <div className="flex items-center gap-2 pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedProducts.size === filteredProducts.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedProducts.size} / {filteredProducts.length} sélectionnés
              </span>
            </div>
          )}
          
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={handleProductSelect}
              onEdit={handleProductEdit}
              onDelete={handleProductDelete}
              isSelected={selectedProducts.has(product.id)}
              viewMode={viewMode}
              showStock={true}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title={productToEdit ? 'Modifier le produit' : 'Créer un produit'}
        description={productToEdit ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit à votre catalogue'}
        size="xl"
      >
        <ProductForm
          initialData={productToEdit}
          categories={categories}
          suppliers={suppliers}
          onSubmit={handleCreateSubmit}
          onCancel={() => {
            setShowCreateModal(false)
            setProductToEdit(null)
          }}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      </Modal>

      {/* Details Modal */}
      {selectedProduct && (
        <Modal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          title={selectedProduct.name}
          size="lg"
        >
          <ProductDetails
            product={selectedProduct}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedProduct(null)
            }}
            onEdit={() => {
              setShowDetailsModal(false)
              handleProductEdit(selectedProduct)
            }}
            onDelete={() => {
              setShowDetailsModal(false)
              handleProductDelete(selectedProduct)
            }}
            canEdit={true}
            canDelete={selectedProduct.status !== 'active'}
          />
        </Modal>
      )}

      {/* Import Modal */}
      <Modal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        title="Importer des produits"
        description="Importez plusieurs produits à partir d'un fichier CSV"
        size="lg"
      >
        <ProductImport
          onImport={handleImport}
          onCancel={() => setShowImportModal(false)}
          categories={categories}
        />
      </Modal>
    </div>
  )
}