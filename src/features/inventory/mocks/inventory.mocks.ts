import type { Product, StockMovement, Warehouse } from '../types/inventory.types'

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-inv-1',
    name: 'Ordinateur Portable Dell XPS 15',
    sku: 'DELL-XPS-15-2024',
    barcode: '1234567890123',
    category: 'Informatique',
    subcategory: 'Ordinateurs portables',
    description: 'Ordinateur portable haute performance pour professionnels',
    status: 'active',
    price: 1499.99,
    cost: 1200,
    weight: 1.8,
    weightUnit: 'kg',
    dimensions: {
      length: 35.7,
      width: 23.5,
      height: 1.7,
      unit: 'cm'
    },
    tags: ['informatique', 'portable', 'dell'],
    images: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'prod-inv-2',
    name: 'Souris sans fil Logitech MX Master 3',
    sku: 'LOG-MXM3-BLK',
    barcode: '0987654321098',
    category: 'Informatique',
    subcategory: 'Périphériques',
    description: 'Souris ergonomique premium pour professionnels',
    status: 'active',
    price: 99.99,
    cost: 65,
    weight: 0.141,
    weightUnit: 'kg',
    tags: ['périphérique', 'souris', 'logitech'],
    images: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'prod-inv-3',
    name: 'Papier A4 Premium 80g/m²',
    sku: 'PAP-A4-80G-500',
    category: 'Fournitures',
    subcategory: 'Papeterie',
    description: 'Ramette de 500 feuilles A4, papier blanc premium',
    status: 'active',
    price: 7.99,
    cost: 5.50,
    weight: 2.5,
    weightUnit: 'kg',
    packSize: 500,
    tags: ['fourniture', 'papier', 'bureau'],
    images: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'prod-inv-4',
    name: 'Clavier mécanique RGB',
    sku: 'KB-MECH-RGB-FR',
    category: 'Informatique',
    subcategory: 'Périphériques',
    description: 'Clavier mécanique gaming avec rétroéclairage RGB',
    status: 'active',
    price: 129.99,
    cost: 85,
    weight: 1.1,
    weightUnit: 'kg',
    tags: ['périphérique', 'clavier', 'gaming'],
    images: [],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: 'prod-inv-5',
    name: 'Chaise de bureau ergonomique',
    sku: 'CHAIR-ERGO-01',
    category: 'Mobilier',
    subcategory: 'Sièges',
    description: 'Chaise de bureau avec support lombaire ajustable',
    status: 'inactive',
    price: 299.99,
    cost: 180,
    weight: 15,
    weightUnit: 'kg',
    dimensions: {
      length: 70,
      width: 70,
      height: 120,
      unit: 'cm'
    },
    tags: ['mobilier', 'chaise', 'ergonomique'],
    images: [],
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-20')
  }
]

export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Entrepôt Principal',
    code: 'WH-MAIN',
    type: 'main',
    address: {
      street: '123 rue de la Logistique',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    },
    isActive: true,
    manager: {
      id: 'user-wh-1',
      firstName: 'Pierre',
      lastName: 'Dupont'
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'wh-2',
    name: 'Entrepôt Secondaire',
    code: 'WH-SEC',
    type: 'secondary',
    address: {
      street: '456 avenue du Stock',
      city: 'Lyon',
      postalCode: '69000',
      country: 'France'
    },
    isActive: true,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-01')
  }
]

export const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    type: 'in',
    reference: 'REC-2024-001',
    date: new Date('2024-01-15'),
    productId: 'prod-inv-1',
    productName: 'Ordinateur Portable Dell XPS 15',
    quantity: 10,
    warehouseId: 'wh-1',
    warehouseName: 'Entrepôt Principal',
    reason: 'purchase_order',
    notes: 'Réception commande fournisseur',
    status: 'completed',
    createdBy: {
      id: 'user-1',
      firstName: 'Admin',
      lastName: 'User'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'mov-2',
    type: 'out',
    reference: 'OUT-2024-001',
    date: new Date('2024-01-20'),
    productId: 'prod-inv-1',
    productName: 'Ordinateur Portable Dell XPS 15',
    quantity: 2,
    warehouseId: 'wh-1',
    warehouseName: 'Entrepôt Principal',
    reason: 'sale',
    notes: 'Vente client #12345',
    status: 'completed',
    createdBy: {
      id: 'user-1',
      firstName: 'Admin',
      lastName: 'User'
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'mov-3',
    type: 'transfer',
    reference: 'TRF-2024-001',
    date: new Date('2024-01-25'),
    productId: 'prod-inv-2',
    productName: 'Souris sans fil Logitech MX Master 3',
    quantity: 5,
    fromWarehouseId: 'wh-1',
    fromWarehouseName: 'Entrepôt Principal',
    toWarehouseId: 'wh-2',
    toWarehouseName: 'Entrepôt Secondaire',
    warehouseName: 'Entrepôt Principal → Entrepôt Secondaire',
    reason: 'stock_balancing',
    notes: 'Équilibrage des stocks entre entrepôts',
    status: 'completed',
    createdBy: {
      id: 'user-1',
      firstName: 'Admin',
      lastName: 'User'
    },
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'mov-4',
    type: 'adjustment',
    reference: 'ADJ-2024-001',
    date: new Date(),
    productId: 'prod-inv-3',
    productName: 'Papier A4 Premium 80g/m²',
    quantity: -5,
    warehouseId: 'wh-1',
    warehouseName: 'Entrepôt Principal',
    reason: 'inventory_count',
    notes: 'Ajustement suite à inventaire physique',
    status: 'pending',
    createdBy: {
      id: 'user-1',
      firstName: 'Admin',
      lastName: 'User'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mov-5',
    type: 'in',
    reference: 'REC-2024-002',
    date: new Date(),
    productId: 'prod-inv-4',
    productName: 'Clavier mécanique RGB',
    quantity: 20,
    warehouseId: 'wh-1',
    warehouseName: 'Entrepôt Principal',
    reason: 'purchase_order',
    notes: 'Nouvelle livraison fournisseur',
    status: 'completed',
    createdBy: {
      id: 'user-1',
      firstName: 'Admin',
      lastName: 'User'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]