import React, { useState, useCallback } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Plus, Trash2, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

import { BulkMovementProps, MovementFormData } from '../StockMovements.types'

interface BulkMovementForm {
  movements: MovementFormData[]
}

const MOVEMENT_TYPES = [
  { value: 'in', label: 'Entrée' },
  { value: 'out', label: 'Sortie' },
  { value: 'transfer', label: 'Transfert' },
  { value: 'adjustment', label: 'Ajustement' }
]

export const BulkMovement: React.FC<BulkMovementProps> = ({
  onSubmit,
  onCancel,
  warehouses = [],
  products = [],
  isLoading = false
}) => {
  const [importMode, setImportMode] = useState<'manual' | 'file'>('manual')
  const [fileError, setFileError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<BulkMovementForm>({
    defaultValues: {
      movements: [
        {
          type: 'in',
          productId: '',
          quantity: 1,
          toWarehouseId: ''
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'movements'
  })

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileError(null)

    if (!file.name.endsWith('.csv')) {
      setFileError('Veuillez sélectionner un fichier CSV')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',').map(h => h.trim())

        // Validate headers
        const requiredHeaders = ['type', 'product_sku', 'quantity', 'warehouse_code']
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
        
        if (missingHeaders.length > 0) {
          setFileError(`Colonnes manquantes: ${missingHeaders.join(', ')}`)
          return
        }

        // Parse data
        const movements: MovementFormData[] = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim())
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index]
          })

          // Map CSV data to movement
          const product = products.find((p: any) => p.sku === row.product_sku)
          const warehouse = warehouses.find((w: any) => w.code === row.warehouse_code)

          if (!product || !warehouse) {
            setFileError(`Ligne ${i + 1}: Produit ou entrepôt non trouvé`)
            return
          }

          movements.push({
            type: row.type as any,
            productId: product.id,
            quantity: parseInt(row.quantity),
            toWarehouseId: row.type === 'in' ? warehouse.id : undefined,
            fromWarehouseId: row.type === 'out' ? warehouse.id : undefined,
            reference: row.reference || '',
            notes: row.notes || ''
          })
        }

        // Update form with parsed movements
        setValue('movements', movements)
        setFileError(null)
      } catch (error) {
        setFileError('Erreur lors de la lecture du fichier')
      }
    }
    reader.readAsText(file)
  }, [products, warehouses, setValue])

  const handleFormSubmit = (data: BulkMovementForm) => {
    onSubmit(data.movements)
  }

  const downloadTemplate = () => {
    const template = 'type,product_sku,quantity,warehouse_code,reference,notes\n' +
                    'in,SKU001,10,WH001,REF001,Reception commande\n' +
                    'out,SKU002,5,WH001,REF002,Expedition client'
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-mouvements.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Import Mode Selection */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant={importMode === 'manual' ? 'default' : 'outline'}
          onClick={() => setImportMode('manual')}
        >
          Saisie manuelle
        </Button>
        <Button
          type="button"
          variant={importMode === 'file' ? 'default' : 'outline'}
          onClick={() => setImportMode('file')}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        {importMode === 'file' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={downloadTemplate}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Télécharger le modèle
          </Button>
        )}
      </div>

      {/* File Import */}
      {importMode === 'file' && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Fichier CSV</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Format: type, product_sku, quantity, warehouse_code, reference, notes
              </p>
            </div>

            {fileError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fileError}</AlertDescription>
              </Alert>
            )}

            {fields.length > 0 && !fileError && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {fields.length} mouvements importés avec succès
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      )}

      {/* Manual Entry */}
      {importMode === 'manual' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Mouvements à créer</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                type: 'in',
                productId: '',
                quantity: 1,
                toWarehouseId: ''
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une ligne
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-2">
                    <Label htmlFor={`movements.${index}.type`}>Type</Label>
                    <Select
                      value={watch(`movements.${index}.type`)}
                      onValueChange={(value) => setValue(`movements.${index}.type`, value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MOVEMENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Label htmlFor={`movements.${index}.productId`}>Produit</Label>
                    <Select
                      value={watch(`movements.${index}.productId`)}
                      onValueChange={(value) => setValue(`movements.${index}.productId`, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product: any) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{product.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">{product.sku}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor={`movements.${index}.quantity`}>Quantité</Label>
                    <Input
                      type="number"
                      {...register(`movements.${index}.quantity`, { valueAsNumber: true })}
                      min="1"
                    />
                  </div>

                  <div className="col-span-3">
                    <Label htmlFor={`movements.${index}.warehouseId`}>Entrepôt</Label>
                    <Select
                      value={
                        watch(`movements.${index}.type`) === 'in' 
                          ? watch(`movements.${index}.toWarehouseId`) 
                          : watch(`movements.${index}.fromWarehouseId`)
                      }
                      onValueChange={(value) => {
                        if (watch(`movements.${index}.type`) === 'in') {
                          setValue(`movements.${index}.toWarehouseId`, value)
                        } else {
                          setValue(`movements.${index}.fromWarehouseId`, value)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse: any) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 flex items-end">
                    <Input
                      placeholder="Référence"
                      {...register(`movements.${index}.reference`)}
                    />
                  </div>

                  <div className="col-span-12 md:col-span-1 flex justify-end">
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
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {fields.length > 0 && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Résumé</p>
              <p className="text-sm text-muted-foreground">
                {fields.length} mouvement{fields.length > 1 ? 's' : ''} à créer
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Quantité totale</p>
              <p className="text-lg font-bold">
                {fields.reduce((sum, field) => sum + (field.quantity || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || fields.length === 0}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Création...
            </>
          ) : (
            <>Créer {fields.length} mouvement{fields.length > 1 ? 's' : ''}</>
          )}
        </Button>
      </div>
    </form>
  )
}