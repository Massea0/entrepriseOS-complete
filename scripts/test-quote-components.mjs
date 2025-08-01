// test-quote-components.mjs
// Script de test pour vérifier les composants Quote

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
}

console.log(`${colors.blue}🔍 Vérification des composants Quote${colors.reset}`)
console.log('====================================\n')

const componentsToCheck = [
  'src/features/finance/components/quotes/QuoteManagement.tsx',
  'src/features/finance/components/quotes/QuoteList.tsx',
  'src/features/finance/components/quotes/QuoteForm.tsx',
  'src/features/finance/components/quotes/QuoteFormItem.tsx',
  'src/features/finance/components/quotes/QuoteFilters.tsx',
  'src/features/finance/components/quotes/QuoteStatusBadge.tsx',
  'src/features/finance/components/quotes/QuoteActions.tsx',
  'src/features/finance/components/quotes/index.ts',
  'src/app/finance/quotes/page.tsx'
]

let allComponentsExist = true

for (const component of componentsToCheck) {
  try {
    await fs.access(join(rootDir, component))
    console.log(`  ${colors.green}✅${colors.reset} ${component}`)
  } catch {
    console.log(`  ${colors.red}❌${colors.reset} ${component}`)
    allComponentsExist = false
  }
}

console.log(`\n${colors.blue}📊 RÉSUMÉ${colors.reset}`)
console.log('==========')

if (allComponentsExist) {
  console.log(`${colors.green}✅ Tous les composants Quote sont créés !${colors.reset}`)
  console.log('\nProchaines étapes:')
  console.log('1. Installer les dépendances: npm install react-hook-form @hookform/resolvers zod date-fns')
  console.log('2. Lancer le serveur de développement: npm run dev')
  console.log('3. Accéder à la page: http://localhost:3000/finance/quotes')
} else {
  console.log(`${colors.yellow}⚠️  Certains composants manquent${colors.reset}`)
}