import React, { useState, useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2, Calculator } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { InventoryService } from '../../../services/inventory.service'
import { PurchaseOrder, Supplier } from '../../../types/inventory.types'
import { OrderFormData, OrderItemFormData } from '../PurchaseOrderManagement.types'

const orderSchema = z.object({
  supplierId: z.string().min(1, 'Le fournisseur est requis'),
  warehouseId: z.string().min(1, 'L\'entrepôt est requis'),
  expectedDate: z.date(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Le produit est requis'),
    quantity: z.number().positive('La quantité doit être positive'),
    unitPrice: z.number().positive('Le prix unitaire doit être positif'),
    taxRate: z.number().min(0).max(100).optional(),
    discount: z.number().min(0).max(100).optional(),
    notes: z.string().optional()
  })).min(1, 'Au moins un article est requis'),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  shippingMethod: z.string().optional(),
  shippingAddress: z.object({
    street: z.string().min(1, 'La rue est requise'),
    city: z.string().min(1, 'La ville est requise'),
    state: z.string().min(1, 'L\'état/région est requis'),
    postalCode: z.string().min(1, 'Le code postal est requis'),
    country: z.string().min(1, 'Le pays est requis')
  }).optional()
})

interface OrderFormProps {
  initialData?: PurchaseOrder | null
  suppliers: Supplier[]
  onSubmit: (data: OrderFormData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const PAYMENT_TERMS = [
  { value: 'net30', label: 'Net 30 jours' },
  { value: 'net60', label: 'Net 60 jours' },
  { value: 'net90', label: 'Net 90 jours' },
  { value: '2/10net30', label: '2% 10 jours, Net 30' },
  { value: 'cod', label: 'Paiement à la livraison' },
  { value: 'prepaid', label: 'Prépayé' }
]

const SHIPPING_METHODS = [
  { value: 'standard', label: 'Standard' },
  { value: 'express', label: 'Express' },
  { value: 'overnight', label: 'Livraison 24h' },
  { value: 'pickup', label: 'Retrait sur place' }
]

export const OrderForm: React.FC<OrderFormProps> = ({
  initialData,
  suppliers,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [useCustomAddress, setUseCustomAddress] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      supplierId: initialData?.supplierId || '',
      warehouseId: initialData?.warehouseId || '',
      expectedDate: initialData?.expectedDate ? new Date(initialData.expectedDate) : new Date(),
      items: initialData?.items?.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.amount,
        taxRate: item.taxRate,
        discount: item.discount,
        notes: item.notes
      })) || [{
        productId: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 20,
        discount: 0
      }],
      notes: initialData?.notes || '',
      paymentTerms: initialData?.paymentTerms || 'net30',
      shippingMethod: initialData?.shippingMethod || 'standard'
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  const supplierId = watch('supplierId')
  const warehouseId = watch('warehouseId')
  const items = watch('items')

  // Fetch data
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => InventoryService.getProducts()
  })

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => InventoryService.getWarehouses()
  })

  const { data: supplierProducts } = useQuery({
    queryKey: ['supplier-products', supplierId],
    queryFn: () => InventoryService.getSupplierProducts(supplierId),
    enabled: !!supplierId
  })

  // Update selected supplier
  useEffect(() => {
    if (supplierId) {
      const supplier = suppliers.find(s => s.id === supplierId)
      setSelectedSupplier(supplier || null)
    }
  }, [supplierId, suppliers])

  // Calculate totals
  const totals = React.useMemo(() => {
    let subtotal = 0
    let taxTotal = 0
    let discountTotal = 0

    items.forEach(item => {
      const itemSubtotal = item.quantity * item.unitPrice
      const discount = itemSubtotal * (item.discount || 0) / 100
      const taxableAmount = itemSubtotal - discount
      const tax = taxableAmount * (item.taxRate || 0) / 100

      subtotal += itemSubtotal
      discountTotal += discount
      taxTotal += tax
    })

    const total = subtotal - discountTotal + taxTotal

    return {
      subtotal,
      discountTotal,
      taxTotal,
      total
    }
  }, [items])

  const handleFormSubmit = (data: OrderFormData) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Informations générales</TabsTrigger>
          <TabsTrigger value="items">Articles</TabsTrigger>
          <TabsTrigger value="shipping">Livraison & Paiement</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierId">Fournisseur *</Label>
              <Select
                value={watch('supplierId')}
                onValueChange={(value) => setValue('supplierId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{supplier.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{supplier.code}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplierId && (
                <p className="text-sm text-destructive">{errors.supplierId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouseId">Entrepôt de livraison *</Label>
              <Select
                value={watch('warehouseId')}
                onValueChange={(value) => setValue('warehouseId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un entrepôt" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses?.data?.map((warehouse: any) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.warehouseId && (
                <p className="text-sm text-destructive">{errors.warehouseId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedDate">Date de livraison attendue *</Label>
              <DatePicker
                date={watch('expectedDate')}
                onDateChange={(date) => setValue('expectedDate', date || new Date())}
                placeholder="Sélectionnez une date"
              />
              {errors.expectedDate && (
                <p className="text-sm text-destructive">{errors.expectedDate.message}</p>
              )}
            </div>
          </div>

          {selectedSupplier && (
            <Card className="p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Informations fournisseur</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Contact</p>
                  <p>{selectedSupplier.contactName}</p>
                  <p>{selectedSupplier.email}</p>
                  <p>{selectedSupplier.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Adresse</p>
                  <p>{selectedSupplier.address?.street}</p>
                  <p>{selectedSupplier.address?.city}, {selectedSupplier.address?.postalCode}</p>
                  <p>{selectedSupplier.address?.country}</p>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notes additionnelles..."
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Articles de la commande</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                productId: '',
                quantity: 1,
                unitPrice: 0,
                taxRate: 20,
                discount: 0
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un article
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-4">
                    <Label htmlFor={`items.${index}.productId`}>Produit</Label>
                    <Select
                      value={watch(`items.${index}.productId`)}
                      onValueChange={(value) => {
                        setValue(`items.${index}.productId`, value)
                        // Auto-fill price if supplier product exists
                        const supplierProduct = supplierProducts?.data?.find((sp: any) => sp.productId === value)
                        if (supplierProduct) {
                          setValue(`items.${index}.unitPrice`, supplierProduct.price.amount)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {(supplierProducts?.data || products?.data || []).map((product: any) => (
                          <SelectItem key={product.id || product.productId} value={product.id || product.productId}>
                            <div className="flex items-center justify-between w-full">
                              <span>{product.name || product.product?.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {product.sku || product.product?.sku}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor={`items.${index}.quantity`}>Quantité</Label>
                    <Input
                      type="number"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      min="1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor={`items.${index}.unitPrice`}>Prix unitaire</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      min="0"
                    />
                  </div>

                  <div className="col-span-1">
                    <Label htmlFor={`items.${index}.taxRate`}>TVA %</Label>
                    <Input
                      type="number"
                      {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="col-span-1">
                    <Label htmlFor={`items.${index}.discount`}>Remise %</Label>
                    <Input
                      type="number"
                      {...register(`items.${index}.discount`, { valueAsNumber: true })}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="col-span-2 flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Total</Label>
                      <div className="text-sm font-medium">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(
                          watch(`items.${index}.quantity`) * watch(`items.${index}.unitPrice`) * 
                          (1 - (watch(`items.${index}.discount`) || 0) / 100) *
                          (1 + (watch(`items.${index}.taxRate`) || 0) / 100)
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="col-span-12">
                    <Input
                      placeholder="Notes pour cet article..."
                      {...register(`items.${index}.notes`)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {errors.items && (
            <p className="text-sm text-destructive">{errors.items.message}</p>
          )}

          {/* Totals */}
          <Card className="p-4 bg-muted/50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total HT</span>
                <span>{new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(totals.subtotal)}</span>
              </div>
              {totals.discountTotal > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Remises</span>
                  <span>-{new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(totals.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>TVA</span>
                <span>{new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(totals.taxTotal)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total TTC</span>
                <span className="text-lg">{new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(totals.total)}</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Conditions de paiement</Label>
              <Select
                value={watch('paymentTerms')}
                onValueChange={(value) => setValue('paymentTerms', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map(term => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingMethod">Méthode de livraison</Label>
              <Select
                value={watch('shippingMethod')}
                onValueChange={(value) => setValue('shippingMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {SHIPPING_METHODS.map(method => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Adresse de livraison</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUseCustomAddress(!useCustomAddress)}
              >
                {useCustomAddress ? 'Utiliser l\'adresse de l\'entrepôt' : 'Adresse personnalisée'}
              </Button>
            </div>

            {useCustomAddress && (
              <Card className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="shippingAddress.street">Rue</Label>
                    <Input
                      {...register('shippingAddress.street')}
                      placeholder="123 rue Example"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress.city">Ville</Label>
                    <Input
                      {...register('shippingAddress.city')}
                      placeholder="Paris"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress.state">État/Région</Label>
                    <Input
                      {...register('shippingAddress.state')}
                      placeholder="Île-de-France"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress.postalCode">Code postal</Label>
                    <Input
                      {...register('shippingAddress.postalCode')}
                      placeholder="75001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress.country">Pays</Label>
                    <Input
                      {...register('shippingAddress.country')}
                      placeholder="France"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {initialData ? 'Mise à jour...' : 'Création...'}
            </>
          ) : (
            <>{initialData ? 'Mettre à jour' : 'Créer la commande'}</>
          )}
        </Button>
      </div>
    </form>
  )
}