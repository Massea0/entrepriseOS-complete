import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Trash2, ImageIcon as Image, Tag as TagIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { ProductFormProps, ProductFormData } from '../ProductCatalog.types'

const productSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  sku: z.string().min(2, 'Le SKU doit contenir au moins 2 caractères'),
  barcode: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  unitOfMeasure: z.string().min(1, 'L\'unité de mesure est requise'),
  trackingType: z.enum(['none', 'lot', 'serial', 'both']),
  status: z.enum(['active', 'inactive', 'discontinued']),
  dimensions: z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
    weight: z.number().min(0).optional()
  }).optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
  supplierProducts: z.array(z.object({
    supplierId: z.string(),
    supplierSku: z.string(),
    price: z.number().min(0),
    leadTime: z.number().min(0),
    minOrderQuantity: z.number().min(1)
  })).optional()
})

const UNITS_OF_MEASURE = [
  { value: 'pcs', label: 'Pièces' },
  { value: 'kg', label: 'Kilogrammes' },
  { value: 'g', label: 'Grammes' },
  { value: 'l', label: 'Litres' },
  { value: 'ml', label: 'Millilitres' },
  { value: 'm', label: 'Mètres' },
  { value: 'cm', label: 'Centimètres' },
  { value: 'box', label: 'Boîtes' },
  { value: 'pack', label: 'Paquets' }
]

const TRACKING_TYPES = [
  { value: 'none', label: 'Aucun suivi' },
  { value: 'lot', label: 'Suivi par lot' },
  { value: 'serial', label: 'Suivi par numéro de série' },
  { value: 'both', label: 'Lot et numéro de série' }
]

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  suppliers = [],
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [newTag, setNewTag] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      sku: initialData?.sku || '',
      barcode: initialData?.barcode || '',
      description: initialData?.description || '',
      categoryId: initialData?.categoryId || '',
      unitOfMeasure: initialData?.unitOfMeasure || 'pcs',
      trackingType: initialData?.trackingType || 'none',
      status: initialData?.status || 'active',
      dimensions: initialData?.dimensions || {
        length: 0,
        width: 0,
        height: 0,
        weight: 0
      },
      images: initialData?.images || [],
      tags: initialData?.tags || [],
      customFields: initialData?.customFields || {},
      supplierProducts: initialData?.supplierProducts?.map(sp => ({
        supplierId: sp.supplierId,
        supplierSku: sp.supplierSku,
        price: sp.price.amount,
        leadTime: sp.leadTime,
        minOrderQuantity: sp.minOrderQuantity
      })) || []
    }
  })

  const { fields: supplierFields, append: appendSupplier, remove: removeSupplier } = useFieldArray({
    control,
    name: 'supplierProducts'
  })

  const watchedImages = watch('images') || []
  const watchedTags = watch('tags') || []

  const handleAddImage = () => {
    if (imageUrl) {
      setValue('images', [...watchedImages, imageUrl])
      setImageUrl('')
    }
  }

  const handleRemoveImage = (index: number) => {
    setValue('images', watchedImages.filter((_, i) => i !== index))
  }

  const handleAddTag = () => {
    if (newTag && !watchedTags.includes(newTag)) {
      setValue('tags', [...watchedTags, newTag])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setValue('tags', watchedTags.filter(t => t !== tag))
  }

  const handleFormSubmit = (data: ProductFormData) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
          <TabsTrigger value="media">Médias</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du produit *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ex: T-shirt coton bio"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                {...register('sku')}
                placeholder="Ex: TSH-BIO-001"
              />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Code-barres</Label>
              <Input
                id="barcode"
                {...register('barcode')}
                placeholder="Ex: 1234567890123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Catégorie *</Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(value) => setValue('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Description détaillée du produit..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitOfMeasure">Unité de mesure *</Label>
              <Select
                value={watch('unitOfMeasure')}
                onValueChange={(value) => setValue('unitOfMeasure', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS_OF_MEASURE.map(unit => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="discontinued">Discontinué</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex items-center gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter un tag..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {watchedTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {watchedTags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="trackingType">Type de suivi</Label>
            <Select
              value={watch('trackingType')}
              onValueChange={(value) => setValue('trackingType', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRACKING_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Définit comment le stock de ce produit sera suivi
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Dimensions & Poids</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dimensions.length">Longueur (cm)</Label>
                <Input
                  type="number"
                  {...register('dimensions.length', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dimensions.width">Largeur (cm)</Label>
                <Input
                  type="number"
                  {...register('dimensions.width', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dimensions.height">Hauteur (cm)</Label>
                <Input
                  type="number"
                  {...register('dimensions.height', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dimensions.weight">Poids (kg)</Label>
                <Input
                  type="number"
                  step="0.001"
                  {...register('dimensions.weight', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Fournisseurs</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendSupplier({
                supplierId: '',
                supplierSku: '',
                price: 0,
                leadTime: 0,
                minOrderQuantity: 1
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un fournisseur
            </Button>
          </div>

          <div className="space-y-4">
            {supplierFields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Fournisseur {index + 1}</h5>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSupplier(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fournisseur</Label>
                      <Select
                        value={watch(`supplierProducts.${index}.supplierId`)}
                        onValueChange={(value) => setValue(`supplierProducts.${index}.supplierId`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>SKU Fournisseur</Label>
                      <Input
                        {...register(`supplierProducts.${index}.supplierSku`)}
                        placeholder="Référence fournisseur"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Prix unitaire (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`supplierProducts.${index}.price`, { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Délai livraison (jours)</Label>
                      <Input
                        type="number"
                        {...register(`supplierProducts.${index}.leadTime`, { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quantité min commande</Label>
                      <Input
                        type="number"
                        {...register(`supplierProducts.${index}.minOrderQuantity`, { valueAsNumber: true })}
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {supplierFields.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun fournisseur configuré</p>
                <p className="text-sm mt-1">
                  Ajoutez des fournisseurs pour ce produit
                </p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-6 mt-6">
          <div className="space-y-4">
            <h4 className="font-medium">Images du produit</h4>
            
            <div className="flex items-center gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL de l'image..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddImage}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>

            {watchedImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {watchedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {index === 0 && (
                      <Badge className="absolute bottom-2 left-2" variant="secondary">
                        Image principale
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune image ajoutée</p>
                <p className="text-sm mt-1">
                  Ajoutez des images pour illustrer votre produit
                </p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <div className="space-y-4">
            <h4 className="font-medium">Champs personnalisés</h4>
            <p className="text-sm text-muted-foreground">
              Ajoutez des champs personnalisés pour stocker des informations supplémentaires
            </p>
            
            <Card className="p-8 text-center text-muted-foreground">
              <p>Fonctionnalité à venir</p>
            </Card>
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
            <>{initialData ? 'Mettre à jour' : 'Créer le produit'}</>
          )}
        </Button>
      </div>
    </form>
  )
}