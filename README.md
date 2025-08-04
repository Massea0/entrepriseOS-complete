# 🚀 EntrepriseOS - Complete SaaS CRM/ERP System

> **Enterprise-grade SaaS CRM/ERP with Modern Frontend + Complete Supabase Backend**

[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.45-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple?logo=vite)](https://vitejs.dev/)

## 🎯 Vue d'Ensemble

**EntrepriseOS** est un système CRM/ERP complet combinant :

1. **🎨 Modern Frontend** - Interface utilisateur moderne développée from scratch
2. **🗄️ Supabase Backend** - Base de données PostgreSQL avec Edge Functions 
3. **📚 Documentation Legacy** - Toute l'historique et docs de développement
4. **⚙️ Scripts & Outils** - Scripts de déploiement et utilitaires

### 🏆 Modules Complets

- **📦 Supply Chain & Inventory** - Gestion complète d'entrepôts et stocks
- **💰 Finance & Accounting** - Facturation, devis, comptabilité multi-devises
- **🤝 CRM Advanced** - Pipeline de ventes, analytics, prévisions
- **👥 HR Management** - RH complète avec organigramme, congés, recrutement
- **🔐 Authentication** - Système d'auth robuste avec 2FA
- **📊 Dashboards** - Tableaux de bord analytics temps réel
- **📋 Project Management** - Kanban, Gantt, time tracking
- **🤖 AI Features** - Intégrations IA avancées (OpenAI, Gemini, Claude)

## 🏗️ Architecture Complète

### **Frontend (Modern)**
```
src/
├── components/          # 100+ composants UI modernes
│   ├── ui/             # Design system (Radix + Tailwind)
│   └── layout/         # Layouts responsifs
├── features/           # Modules métier
│   ├── inventory/      # 📦 Supply Chain & Inventory (NOUVEAU)
│   ├── finance/        # 💰 Finance & Accounting
│   ├── crm/           # 🤝 CRM Pipeline
│   ├── hr/            # 👥 Human Resources
│   ├── auth/          # 🔐 Authentication
│   ├── dashboard/     # 📊 Analytics Dashboards
│   └── projects/      # 📋 Project Management
├── services/          # Services API
└── utils/             # Utilitaires
```

### **Backend (Supabase)**
```
supabase/
├── migrations/        # 50+ migrations PostgreSQL
├── functions/         # 30+ Edge Functions
│   ├── ai-*          # Features IA (OpenAI, Gemini, Claude)
│   ├── *-api         # APIs métier
│   └── integrations/ # Intégrations tierces
└── config.toml       # Configuration Supabase
```

### **Documentation & Legacy**
```
docs/
├── legacy-docs/       # 50+ docs de l'ancien projet
│   ├── migration/     # Guides de migration
│   ├── fixes/         # Historique des fixes
│   └── roadmaps/      # Roadmaps et TODOs
├── ARCHITECTURE.md    # Architecture moderne
├── DESIGN_SYSTEM.md   # Guide design system
└── API.md            # Documentation API
```

## 🗄️ Configuration de la base de données

**IMPORTANT** : Avant de démarrer l'application, vous devez configurer Supabase.

👉 **Suivez le guide complet : [SUPABASE_SETUP.md](SUPABASE_SETUP.md)**

## 🚀 Quick Start

### 1. Installation

```bash
# Cloner le repository
git clone <repository-url>
cd entrepriseOS-complete

# Installer les dépendances
npm install

# Configuration environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase
```

### 2. Configuration Supabase

#### Option A : Utiliser Supabase Existant
```bash
# Mettre vos clés dans .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Option B : Nouveau Projet Supabase
```bash
# Setup local Supabase
npx supabase start

# Appliquer les migrations
npx supabase db push

# Déployer les Edge Functions
npx supabase functions deploy
```

### 3. Lancement

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

## 📦 Module Supply Chain & Inventory

### 🆕 **Nouveau Module Enterprise**

Le module d'inventaire est un système WMS (Warehouse Management System) complet :

#### **Fonctionnalités Principales**
- **Multi-Warehouse** - Gestion illimitée d'entrepôts
- **Product Catalog** - Catalogue avec variantes, bundles, serial/lot tracking
- **Stock Management** - Niveaux temps réel, mouvements, ajustements
- **Supplier Management** - Base fournisseurs avec scoring automatique
- **Purchase Orders** - Workflow complet avec approbations multi-niveaux
- **Advanced Analytics** - ABC analysis, rotation stock, prévisions IA

#### **Types TypeScript (1000+ lignes)**
```typescript
// Gestion multi-warehouse avec hiérarchie
interface Warehouse {
  zones: WarehouseZone[]        // Zone → Aisle → Shelf → Position
  operatingHours: Schedule[]
  configuration: WarehouseConfig
}

// Traçabilité complète
interface StockLevel {
  serialNumber?: string
  lotNumber?: string
  expirationDate?: Date
  quantityTracking: QuantityBreakdown
}

// Business logic avancée
InventoryUtils.calculateEOQ()           // Economic Order Quantity
InventoryUtils.calculateAbcClassification()  // Classification ABC
InventoryUtils.calculateFifoCost()      // Costing FIFO/LIFO
```

#### **Service Layer (80+ endpoints)**
```typescript
// Operations core
InventoryService.getProducts()
InventoryService.createStockMovement()
InventoryService.getStockAvailability()

// Analytics avancées
InventoryService.runAbcAnalysis()
InventoryService.getStockTurnoverAnalysis()
InventoryService.getSlowMovingItems()

// Mobile & Barcode
InventoryService.lookupByBarcode()
InventoryService.generateBarcode()
```

## 🗄️ Base de Données Supabase

### **Tables Principales**

#### **Core Business**
- `companies` - Multi-tenancy
- `profiles` - Utilisateurs étendus
- `departments` & `positions` - Structure organisationnelle

#### **HR Management**
- `employees` - Gestion employés
- `leave_types`, `leave_requests`, `leave_balances` - Congés
- `recruitment` - Processus de recrutement

#### **Project Management**
- `projects` & `tasks` - Gestion projets
- `time_tracking` - Suivi temps

#### **Finance**
- `invoices`, `devis`, `contracts` - Documents financiers
- `expenses`, `payments` - Transactions

#### **Inventory (Nouveau)**
- `products`, `warehouses` - Catalogue et entrepôts
- `stock_levels`, `stock_movements` - Gestion stock
- `suppliers`, `purchase_orders` - Approvisionnement

#### **AI & Analytics**
- `ai_agents`, `ai_agent_actions` - Système IA
- `audit_logs` - Traçabilité complète

### **Row Level Security (RLS)**

Toutes les tables ont des policies RLS pour :
- **Multi-tenancy** au niveau company
- **Role-based access** (admin, manager, employee, client)
- **Data isolation** complète entre entreprises

### **Edge Functions (30+)**

#### **AI Features**
- `ai-business-analyzer` - Analyse business IA
- `ai-financial-predictions` - Prédictions financières
- `ai-performance-optimizer` - Optimisation performance
- `gemini-live-voice` - Assistant vocal

#### **Business Logic**
- `auto-assign-project` - Assignation automatique
- `smart-task-assignment` - Assignation intelligente
- `bulk-create-tasks` - Création en masse

#### **Integrations**
- `third-party-integrations` - APIs tierces
- `send-notification-email` - Notifications email
- `mobile-api` - API mobile

## 🎨 Design System Moderne

### **Composants UI (100+)**

#### **Primitives (Radix UI)**
- `Button`, `Input`, `Select`, `Checkbox` - Inputs
- `Modal`, `Popover`, `Tooltip`, `Alert` - Overlays
- `Table`, `Pagination`, `Tabs` - Data display

#### **Complex Components**
- `DataTable` - Tables avec tri, filtres, pagination
- `CommandPalette` - Commandes rapides (Cmd+K)
- `DatePicker` - Sélecteurs de dates avancés
- `SalesPipeline` - Pipeline CRM interactif

#### **Business Components**
- `InvoiceManagement` - Gestion factures
- `WarehouseManager` - Gestion entrepôts (en développement)
- `StockMovements` - Historique mouvements
- `SupplierScoring` - Scoring fournisseurs

### **Theming**
- **Dark/Light Mode** - Automatic switching
- **Color Palette** - Semantic colors (primary, success, warning, error)
- **Typography** - Inter + JetBrains Mono
- **Animations** - Framer Motion micro-interactions

## 🤖 Fonctionnalités IA

### **Providers Multiples**
- **OpenAI** GPT-4 pour analysis business
- **Google Gemini** pour voice et analytics
- **Claude** pour documentation et support
- **Whisper** pour transcription
- **ElevenLabs** pour text-to-speech

### **Features IA Intégrées**
- **Auto-assignment** de projets et tâches
- **Predictive Analytics** pour finance et stock
- **Smart Notifications** contextuelles
- **Voice Assistant** avec Gemini Live
- **Document Generation** automatique

### **Configuration Flexible**
- **Feature Flags** pour activer/désactiver l'IA
- **Credits System** pour la facturation IA
- **Multi-provider** avec fallback automatique

## 📱 Progressive Web App

### **Features PWA**
- **Offline Capability** pour opérations critiques
- **Push Notifications** pour alertes temps réel
- **Service Worker** avec cache intelligent
- **Installation** desktop et mobile

### **Mobile Optimizations**
- **Touch-friendly** interfaces
- **Responsive Design** mobile-first
- **Barcode Scanning** avec camera API
- **Gesture Support** pour navigation

## 🔒 Sécurité Enterprise

### **Authentication**
- **JWT** avec refresh tokens automatique
- **2FA** avec TOTP (Google Authenticator)
- **Magic Links** pour connexion sans mot de passe
- **OAuth** Google, GitHub, Apple

### **Authorization**
- **RBAC** (Role-Based Access Control)
- **Company Isolation** via RLS
- **Audit Trail** complet de toutes les actions
- **Session Management** sécurisé

### **Data Protection**
- **Encryption** at rest et in transit
- **GDPR Compliance** avec droit à l'oubli
- **SOX Controls** pour finance
- **Backup** automatique et disaster recovery

## 📊 Analytics & Monitoring

### **Business Intelligence**
- **Real-time Dashboards** avec métriques temps réel
- **KPIs Tracking** personnalisables
- **Forecasting** avec machine learning
- **Custom Reports** avec export PDF/Excel

### **Technical Monitoring**
- **Core Web Vitals** tracking
- **Error Monitoring** avec stack traces
- **Performance Metrics** détaillées
- **Usage Analytics** pour optimisation UX

## 🚀 Déploiement

### **Environnements**
- **Development** - Local avec Supabase local
- **Staging** - Preview deployments automatiques
- **Production** - Supabase Cloud + CDN global

### **CI/CD Ready**
```yaml
# GitHub Actions workflow inclus
- Build & Test automatiques
- Deployment staging sur PR
- Production deployment sur main
- Security scanning
- Performance testing
```

### **Scaling Options**
- **Vercel/Netlify** pour le frontend
- **Supabase** auto-scaling pour le backend
- **CDN** global pour assets statiques
- **Multi-region** deployment possible

## 📚 Documentation

### **Guides Utilisateur**
- **[Installation](./docs/INSTALLATION.md)** - Setup complet pas à pas
- **[Architecture](./docs/ARCHITECTURE.md)** - Architecture détaillée
- **[Design System](./docs/DESIGN_SYSTEM.md)** - Guide du design system
- **[API Reference](./docs/API.md)** - Documentation API complète

### **Documentation Legacy**
- **[Migration Guides](./docs/legacy-docs/)** - Historique des migrations
- **[Fix Reports](./docs/legacy-docs/)** - Résolution de bugs
- **[Roadmaps](./docs/legacy-docs/)** - Plans de développement
- **[Success Stories](./docs/legacy-docs/)** - Réussites du projet

### **Pour Développeurs**
- **[Component Library](./docs/COMPONENTS.md)** - Guide des composants
- **[Contributing](./CONTRIBUTING.md)** - Guide de contribution
- **[Testing](./docs/TESTING.md)** - Stratégie de tests
- **[Deployment](./docs/DEPLOYMENT.md)** - Guide de déploiement

## 🛠️ Scripts Utilitaires

### **Development**
```bash
npm run dev              # Développement avec hot reload
npm run build           # Build production
npm run preview         # Preview du build
npm run test            # Tests unitaires
npm run test:e2e        # Tests E2E
```

### **Database**
```bash
npm run db:start        # Démarrer Supabase local
npm run db:push         # Appliquer migrations
npm run db:reset        # Reset DB locale
npm run db:seed         # Seed avec données test
```

### **Legacy Scripts**
```bash
./start-windows.bat     # Démarrage Windows
./start-mac.sh          # Démarrage macOS
./fix-mac-setup.sh      # Fix setup macOS
```

## 🗺️ Roadmap

### **Phase Actuelle ✅ (Completed)**
- Frontend moderne complet
- Module Inventory enterprise
- Integration Supabase complète
- Documentation comprehensive

### **Phase Suivante 🔄 (Q1 2025)**
- Finalisation UI components Inventory
- Mobile app React Native
- Advanced analytics dashboard
- AI features enhancement

### **Phase Future 📅 (Q2+ 2025)**
- 3D warehouse visualization
- Voice commands interface
- IoT sensors integration
- Blockchain integration

## 🤝 Contribution

### **Comment Contribuer**
1. Fork le projet
2. Créer une feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branch (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### **Standards Code**
- **TypeScript** strict mode
- **ESLint + Prettier** pour formatting
- **Conventional Commits** pour messages
- **Tests** obligatoires pour nouvelles features

## 📄 License

Ce projet est sous licence **MIT**. Voir [LICENSE](LICENSE) pour plus d'informations.

## 👥 Team & Support

### **Core Team**
- **Lead Developer** - Architecture & Development
- **UI/UX Designer** - Design System & User Experience  
- **DevOps Engineer** - Infrastructure & Deployment
- **Product Manager** - Roadmap & Features

### **Support**
- **Documentation**: [docs.entrepriseos.com](https://docs.entrepriseos.com)
- **Email**: support@entrepriseos.com
- **Discord**: [Join our community](https://discord.gg/entrepriseos)
- **GitHub Issues**: Pour bugs et feature requests

---

**🎯 EntrepriseOS combine le meilleur du moderne (React 18, TypeScript, Vite) avec un backend enterprise robuste (Supabase, PostgreSQL, Edge Functions) pour créer le SaaS CRM/ERP le plus avancé du marché.**

**Made with ❤️ for modern enterprises**