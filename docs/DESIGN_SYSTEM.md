# 🎨 Design System - Enterprise OS

## 📋 Introduction

Ce design system est conçu pour créer une expérience utilisateur cohérente, moderne et performante à travers toute l'application Enterprise OS. Il suit les principes de design moderne tout en restant accessible et professionnel.

## 🎯 Principes de Design

### 1. **Clarté**
- Hiérarchie visuelle claire
- Espaces blancs généreux
- Typographie lisible

### 2. **Cohérence**
- Patterns réutilisables
- Comportements prévisibles
- Langage visuel unifié

### 3. **Efficacité**
- Interactions rapides
- Feedback immédiat
- Workflows optimisés

### 4. **Accessibilité**
- WCAG AAA compliance
- Navigation au clavier
- Support lecteur d'écran

## 🎨 Fondations

### Couleurs

#### Palette Principale
```css
/* Primary - Indigo */
--primary-50: #eef2ff;
--primary-100: #e0e7ff;
--primary-200: #c7d2fe;
--primary-300: #a5b4fc;
--primary-400: #818cf8;
--primary-500: #6366f1;  /* Main */
--primary-600: #4f46e5;
--primary-700: #4338ca;
--primary-800: #3730a3;
--primary-900: #312e81;
--primary-950: #1e1b4b;

/* Neutral - Gray */
--gray-50: #fafafa;
--gray-100: #f4f4f5;
--gray-200: #e4e4e7;
--gray-300: #d4d4d8;
--gray-400: #a1a1aa;
--gray-500: #71717a;
--gray-600: #52525b;
--gray-700: #3f3f46;
--gray-800: #27272a;
--gray-900: #18181b;
--gray-950: #09090b;
```

#### Couleurs Sémantiques
```css
/* Success - Green */
--success: #10b981;
--success-light: #34d399;
--success-dark: #059669;

/* Warning - Amber */
--warning: #f59e0b;
--warning-light: #fbbf24;
--warning-dark: #d97706;

/* Error - Red */
--error: #ef4444;
--error-light: #f87171;
--error-dark: #dc2626;

/* Info - Blue */
--info: #3b82f6;
--info-light: #60a5fa;
--info-dark: #2563eb;
```

### Typographie

#### Font Stack
```css
--font-sans: 'Inter var', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

#### Échelle Typographique
```css
/* Headings */
--text-h1: 3rem;      /* 48px */
--text-h2: 2.25rem;   /* 36px */
--text-h3: 1.875rem;  /* 30px */
--text-h4: 1.5rem;    /* 24px */
--text-h5: 1.25rem;   /* 20px */
--text-h6: 1.125rem;  /* 18px */

/* Body */
--text-base: 1rem;    /* 16px */
--text-sm: 0.875rem;  /* 14px */
--text-xs: 0.75rem;   /* 12px */
--text-2xs: 0.625rem; /* 10px */

/* Line Heights */
--leading-none: 1;
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
--leading-loose: 2;

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Espacements

```css
/* Spacing Scale */
--spacing-0: 0;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
```

### Coins Arrondis

```css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-3xl: 1.5rem;     /* 24px */
--radius-full: 9999px;
```

### Ombres

```css
/* Light Mode */
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Dark Mode */
--shadow-dark-sm: 0 1px 3px 0 rgb(0 0 0 / 0.3);
--shadow-dark-md: 0 4px 6px -1px rgb(0 0 0 / 0.3);
--shadow-dark-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3);
```

### Animations

```css
/* Durées */
--animation-fast: 150ms;
--animation-normal: 300ms;
--animation-slow: 500ms;

/* Easings */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

## 🧩 Composants

### Button

#### Variantes
- **Primary** - Actions principales
- **Secondary** - Actions secondaires
- **Ghost** - Actions tertiaires
- **Danger** - Actions destructives
- **Success** - Actions positives

#### Tailles
- **xs** - 28px hauteur
- **sm** - 32px hauteur
- **md** - 40px hauteur (défaut)
- **lg** - 48px hauteur
- **xl** - 56px hauteur

#### États
- Default
- Hover (+5% luminosité)
- Active (-5% luminosité)
- Disabled (50% opacité)
- Loading (spinner)

### Input

#### Types
- Text
- Email
- Password
- Number
- Search
- Textarea

#### États
- Default
- Focus (ring primary)
- Error (border red)
- Disabled (background gray)
- Readonly (cursor not-allowed)

### Card

#### Variantes
- **Default** - Fond blanc/gray-900
- **Bordered** - Border visible
- **Elevated** - Shadow lg
- **Interactive** - Hover effects

#### Sections
- Header (optionnel)
- Body
- Footer (optionnel)

## 📐 Layout Patterns

### Grid System

```css
/* 12 colonnes responsive */
.grid-cols-1   /* Mobile */
.sm:grid-cols-2   /* 640px+ */
.md:grid-cols-3   /* 768px+ */
.lg:grid-cols-4   /* 1024px+ */
.xl:grid-cols-6   /* 1280px+ */
.2xl:grid-cols-12 /* 1536px+ */
```

### Container

```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}

@media (min-width: 1536px) {
  .container { max-width: 1400px; }
}
```

## 🎯 Patterns d'Interaction

### Feedback Utilisateur

#### Toast Notifications
- Position: top-right
- Durée: 3-5 secondes
- Auto-dismiss
- Actions optionnelles

#### Loading States
- Skeleton screens pour le contenu
- Spinners pour les actions
- Progress bars pour les uploads
- Shimmer effects pour les placeholders

### Navigation

#### Sidebar
- Largeur: 280px (expanded)
- Largeur: 80px (collapsed)
- Transition: 300ms ease
- Sticky positioning

#### Command Palette
- Trigger: Cmd/Ctrl + K
- Search fuzzy
- Actions récentes
- Navigation rapide

## 🌓 Dark Mode

### Implémentation
```css
/* Automatic based on system preference */
@media (prefers-color-scheme: dark) {
  :root {
    --background: var(--gray-900);
    --foreground: var(--gray-50);
  }
}

/* Manual toggle with class */
.dark {
  --background: var(--gray-900);
  --foreground: var(--gray-50);
}
```

### Adaptations
- Inversement des couleurs de fond
- Réduction du contraste (90% au lieu de 100%)
- Ombres plus douces
- Borders plus subtiles

## ♿ Accessibilité

### Standards
- WCAG 2.1 niveau AAA
- Contraste minimum 7:1 (texte normal)
- Contraste minimum 4.5:1 (texte large)

### Implémentation
- Labels ARIA appropriés
- Rôles sémantiques
- Navigation au clavier complète
- Focus visible personnalisé
- Skip links

### Tests
- Screen reader testing (NVDA, JAWS)
- Keyboard-only navigation
- Color contrast analyzers
- Automated accessibility audits

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
--screen-sm: 640px;   /* Paysage mobile */
--screen-md: 768px;   /* Tablette portrait */
--screen-lg: 1024px;  /* Tablette paysage */
--screen-xl: 1280px;  /* Desktop */
--screen-2xl: 1536px; /* Large desktop */
```

### Stratégies
- Mobile-first development
- Touch-friendly targets (44px minimum)
- Flexible grids
- Fluid typography
- Responsive images

## 🎭 Micro-Interactions

### Principes
- Feedback instantané
- Transitions fluides
- Animations purposeful
- Performance optimale

### Exemples
```css
/* Button hover */
.button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  transition: all var(--animation-fast) var(--ease-smooth);
}

/* Card interaction */
.card-interactive:hover {
  transform: scale(1.02);
  transition: transform var(--animation-normal) var(--ease-smooth);
}

/* Loading shimmer */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

## 📋 Guidelines d'Usage

### Do's ✅
- Utiliser les tokens de design
- Maintenir la cohérence
- Prioriser l'accessibilité
- Tester sur tous les devices
- Documenter les déviations

### Don'ts ❌
- Créer des one-off styles
- Ignorer les patterns établis
- Surcharger d'animations
- Négliger la performance
- Oublier le dark mode

---

*Ce design system évolue constamment. Toute modification doit être documentée et approuvée par l'équipe design.*