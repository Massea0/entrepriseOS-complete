import { Warehouse, WarehouseZone } from '../types/inventory.types'

// Zones mock pour chaque entrepôt
export const MOCK_ZONES: Record<string, WarehouseZone[]> = {
  'warehouse-1': [
    {
      id: 'zone-1-1',
      warehouseId: 'warehouse-1',
      name: 'Zone A - Réception',
      code: 'A',
      type: 'receiving',
      capacity: { total: 500, used: 120, unit: 'palettes' },
      temperature: { min: 15, max: 25, unit: 'celsius' },
      humidity: { min: 40, max: 60, unit: 'percent' },
      locations: [
        { aisle: 'A1', shelf: '01', position: 'A' },
        { aisle: 'A1', shelf: '01', position: 'B' },
        { aisle: 'A1', shelf: '02', position: 'A' },
        { aisle: 'A1', shelf: '02', position: 'B' }
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'zone-1-2',
      warehouseId: 'warehouse-1',
      name: 'Zone B - Stockage Principal',
      code: 'B',
      type: 'storage',
      capacity: { total: 2000, used: 1450, unit: 'palettes' },
      temperature: { min: 15, max: 25, unit: 'celsius' },
      humidity: { min: 40, max: 60, unit: 'percent' },
      locations: Array.from({ length: 20 }, (_, i) => ({
        aisle: `B${Math.floor(i / 4) + 1}`,
        shelf: `${String(i % 4 + 1).padStart(2, '0')}`,
        position: 'A'
      })),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'zone-1-3',
      warehouseId: 'warehouse-1',
      name: 'Zone C - Stockage Froid',
      code: 'C',
      type: 'cold_storage',
      capacity: { total: 300, used: 210, unit: 'palettes' },
      temperature: { min: 2, max: 8, unit: 'celsius' },
      humidity: { min: 50, max: 70, unit: 'percent' },
      locations: Array.from({ length: 8 }, (_, i) => ({
        aisle: `C${Math.floor(i / 2) + 1}`,
        shelf: `${String(i % 2 + 1).padStart(2, '0')}`,
        position: 'A'
      })),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'zone-1-4',
      warehouseId: 'warehouse-1',
      name: 'Zone D - Expédition',
      code: 'D',
      type: 'shipping',
      capacity: { total: 400, used: 85, unit: 'palettes' },
      temperature: { min: 15, max: 25, unit: 'celsius' },
      humidity: { min: 40, max: 60, unit: 'percent' },
      locations: Array.from({ length: 10 }, (_, i) => ({
        aisle: `D${Math.floor(i / 5) + 1}`,
        shelf: `${String(i % 5 + 1).padStart(2, '0')}`,
        position: 'A'
      })),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  ],
  'warehouse-2': [
    {
      id: 'zone-2-1',
      warehouseId: 'warehouse-2',
      name: 'Zone A - Stockage Général',
      code: 'A',
      type: 'storage',
      capacity: { total: 800, used: 620, unit: 'palettes' },
      temperature: { min: 10, max: 30, unit: 'celsius' },
      humidity: { min: 30, max: 70, unit: 'percent' },
      locations: Array.from({ length: 12 }, (_, i) => ({
        aisle: `A${Math.floor(i / 3) + 1}`,
        shelf: `${String(i % 3 + 1).padStart(2, '0')}`,
        position: 'A'
      })),
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: 'zone-2-2',
      warehouseId: 'warehouse-2',
      name: 'Zone B - Transit',
      code: 'B',
      type: 'transit',
      capacity: { total: 200, used: 45, unit: 'palettes' },
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    }
  ],
  'warehouse-3': [
    {
      id: 'zone-3-1',
      warehouseId: 'warehouse-3',
      name: 'Zone Unique',
      code: 'A',
      type: 'storage',
      capacity: { total: 150, used: 95, unit: 'palettes' },
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    }
  ]
}

// Entrepôts mock
export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'warehouse-1',
    name: 'Entrepôt Principal Paris',
    code: 'WH-PAR-001',
    type: 'main',
    status: 'active',
    address: {
      street: '123 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
      coordinates: { lat: 48.8698, lng: 2.3077 }
    },
    capacity: {
      total: 3200,
      used: 1865,
      unit: 'palettes'
    },
    zones: MOCK_ZONES['warehouse-1'],
    operatingHours: {
      monday: { open: '07:00', close: '20:00' },
      tuesday: { open: '07:00', close: '20:00' },
      wednesday: { open: '07:00', close: '20:00' },
      thursday: { open: '07:00', close: '20:00' },
      friday: { open: '07:00', close: '20:00' },
      saturday: { open: '08:00', close: '16:00' },
      sunday: { open: 'closed', close: 'closed' }
    },
    contactEmail: 'warehouse.paris@entreprise.com',
    contactPhone: '+33 1 23 45 67 89',
    manager: 'Jean Dupont',
    features: [
      'temperature_controlled',
      'security_24_7',
      'loading_dock',
      'forklift',
      'pallet_jack',
      'barcode_scanning',
      'automated_sorting'
    ],
    stats: {
      totalProducts: 1250,
      totalValue: 2450000,
      incomingToday: 25,
      outgoingToday: 32,
      lowStockItems: 8,
      expiringSoon: 3
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'warehouse-2',
    name: 'Centre de Distribution Lyon',
    code: 'WH-LYO-001',
    type: 'distribution',
    status: 'active',
    address: {
      street: '45 Rue de la République',
      city: 'Lyon',
      postalCode: '69002',
      country: 'France',
      coordinates: { lat: 45.7640, lng: 4.8357 }
    },
    capacity: {
      total: 1000,
      used: 665,
      unit: 'palettes'
    },
    zones: MOCK_ZONES['warehouse-2'],
    operatingHours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '22:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: 'closed', close: 'closed' }
    },
    contactEmail: 'warehouse.lyon@entreprise.com',
    contactPhone: '+33 4 78 90 12 34',
    manager: 'Marie Martin',
    features: [
      'loading_dock',
      'forklift',
      'barcode_scanning',
      'express_shipping'
    ],
    stats: {
      totalProducts: 450,
      totalValue: 890000,
      incomingToday: 12,
      outgoingToday: 18,
      lowStockItems: 3,
      expiringSoon: 1
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'warehouse-3',
    name: 'Point de Transit Marseille',
    code: 'WH-MAR-001',
    type: 'transit',
    status: 'active',
    address: {
      street: '78 Boulevard du Port',
      city: 'Marseille',
      postalCode: '13002',
      country: 'France',
      coordinates: { lat: 43.2965, lng: 5.3698 }
    },
    capacity: {
      total: 150,
      used: 95,
      unit: 'palettes'
    },
    zones: MOCK_ZONES['warehouse-3'],
    operatingHours: {
      monday: { open: '24h', close: '24h' },
      tuesday: { open: '24h', close: '24h' },
      wednesday: { open: '24h', close: '24h' },
      thursday: { open: '24h', close: '24h' },
      friday: { open: '24h', close: '24h' },
      saturday: { open: '24h', close: '24h' },
      sunday: { open: '24h', close: '24h' }
    },
    contactEmail: 'transit.marseille@entreprise.com',
    contactPhone: '+33 4 91 23 45 67',
    manager: 'Pierre Bernard',
    features: [
      'security_24_7',
      'cross_docking',
      'express_shipping'
    ],
    stats: {
      totalProducts: 95,
      totalValue: 125000,
      incomingToday: 45,
      outgoingToday: 42,
      lowStockItems: 0,
      expiringSoon: 0
    },
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  }
]

// Statistiques globales
export const MOCK_WAREHOUSE_STATS = {
  totalWarehouses: MOCK_WAREHOUSES.length,
  totalCapacity: MOCK_WAREHOUSES.reduce((acc, w) => acc + w.capacity.total, 0),
  totalUsed: MOCK_WAREHOUSES.reduce((acc, w) => acc + w.capacity.used, 0),
  totalProducts: MOCK_WAREHOUSES.reduce((acc, w) => acc + (w.stats?.totalProducts || 0), 0),
  totalValue: MOCK_WAREHOUSES.reduce((acc, w) => acc + (w.stats?.totalValue || 0), 0),
  utilizationRate: Math.round(
    (MOCK_WAREHOUSES.reduce((acc, w) => acc + w.capacity.used, 0) / 
     MOCK_WAREHOUSES.reduce((acc, w) => acc + w.capacity.total, 0)) * 100
  )
}