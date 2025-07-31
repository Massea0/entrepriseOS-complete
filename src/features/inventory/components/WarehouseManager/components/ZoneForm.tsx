import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

import { WarehouseZone } from '../../../types/inventory.types'
import { ZoneFormData } from '../WarehouseManager.types'

const zoneSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  code: z.string().min(2, 'Le code doit contenir au moins 2 caractères').max(10, 'Le code ne peut pas dépasser 10 caractères'),
  type: z.enum(['storage', 'picking', 'receiving', 'shipping', 'quarantine', 'returns']),
  temperature: z.enum(['ambient', 'refrigerated', 'frozen']).optional(),
  securityLevel: z.enum(['standard', 'restricted', 'high-security']).optional(),
  maxWeight: z.number().positive('Le poids maximum doit être positif').optional(),
  maxVolume: z.number().positive('Le volume maximum doit être positif').optional(),
  aisles: z.number().int().positive('Le nombre d\'allées doit être positif').optional(),
  shelves: z.number().int().positive('Le nombre d\'étagères doit être positif').optional(),
  positions: z.number().int().positive('Le nombre de positions doit être positif').optional()
})

interface ZoneFormProps {
  initialData?: Partial<WarehouseZone>
  onSubmit: (data: ZoneFormData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const ZONE_TYPES = [
  { value: 'storage', label: 'Stockage' },
  { value: 'picking', label: 'Préparation' },
  { value: 'receiving', label: 'Réception' },
  { value: 'shipping', label: 'Expédition' },
  { value: 'quarantine', label: 'Quarantaine' },
  { value: 'returns', label: 'Retours' }
]

const TEMPERATURES = [
  { value: 'ambient', label: 'Ambiant' },
  { value: 'refrigerated', label: 'Réfrigéré (2-8°C)' },
  { value: 'frozen', label: 'Congelé (-18°C)' }
]

const SECURITY_LEVELS = [
  { value: 'standard', label: 'Standard' },
  { value: 'restricted', label: 'Restreint' },
  { value: 'high-security', label: 'Haute sécurité' }
]

export const ZoneForm: React.FC<ZoneFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      type: initialData?.type || 'storage',
      temperature: initialData?.temperature || 'ambient',
      securityLevel: initialData?.securityLevel || 'standard',
      maxWeight: initialData?.maxWeight || undefined,
      maxVolume: initialData?.maxVolume || undefined,
      aisles: initialData?.aisles || undefined,
      shelves: initialData?.shelves || undefined,
      positions: initialData?.positions || undefined
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom de la zone</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Zone A1"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            {...register('code')}
            placeholder="A1"
            className="uppercase"
          />
          {errors.code && (
            <p className="text-sm text-destructive">{errors.code.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type de zone</Label>
        <Select
          value={watch('type')}
          onValueChange={(value) => setValue('type', value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un type" />
          </SelectTrigger>
          <SelectContent>
            {ZONE_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="temperature">Température</Label>
          <Select
            value={watch('temperature')}
            onValueChange={(value) => setValue('temperature', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une température" />
            </SelectTrigger>
            <SelectContent>
              {TEMPERATURES.map(temp => (
                <SelectItem key={temp.value} value={temp.value}>
                  {temp.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="securityLevel">Niveau de sécurité</Label>
          <Select
            value={watch('securityLevel')}
            onValueChange={(value) => setValue('securityLevel', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un niveau" />
            </SelectTrigger>
            <SelectContent>
              {SECURITY_LEVELS.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Capacité</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxWeight">Poids maximum (kg)</Label>
            <Input
              id="maxWeight"
              type="number"
              {...register('maxWeight', { valueAsNumber: true })}
              placeholder="10000"
            />
            {errors.maxWeight && (
              <p className="text-sm text-destructive">{errors.maxWeight.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxVolume">Volume maximum (m³)</Label>
            <Input
              id="maxVolume"
              type="number"
              {...register('maxVolume', { valueAsNumber: true })}
              placeholder="500"
            />
            {errors.maxVolume && (
              <p className="text-sm text-destructive">{errors.maxVolume.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Configuration physique</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="aisles">Nombre d'allées</Label>
            <Input
              id="aisles"
              type="number"
              {...register('aisles', { valueAsNumber: true })}
              placeholder="5"
            />
            {errors.aisles && (
              <p className="text-sm text-destructive">{errors.aisles.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shelves">Étagères par allée</Label>
            <Input
              id="shelves"
              type="number"
              {...register('shelves', { valueAsNumber: true })}
              placeholder="10"
            />
            {errors.shelves && (
              <p className="text-sm text-destructive">{errors.shelves.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="positions">Positions par étagère</Label>
            <Input
              id="positions"
              type="number"
              {...register('positions', { valueAsNumber: true })}
              placeholder="20"
            />
            {errors.positions && (
              <p className="text-sm text-destructive">{errors.positions.message}</p>
            )}
          </div>
        </div>

        {watch('aisles') && watch('shelves') && watch('positions') && (
          <p className="text-sm text-muted-foreground">
            Total: {(watch('aisles') || 0) * (watch('shelves') || 0) * (watch('positions') || 0)} positions
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3">
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
              Enregistrement...
            </>
          ) : (
            initialData ? 'Mettre à jour' : 'Créer'
          )}
        </Button>
      </div>
    </form>
  )
}