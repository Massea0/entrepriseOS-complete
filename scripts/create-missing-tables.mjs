#!/usr/bin/env node
import { supabase } from './supabase-admin.mjs';
import chalk from 'chalk';

console.log(chalk.cyan.bold('\n🔧 Création des tables manquantes dans Supabase\n'));

// SQL pour créer les tables manquantes
const createQuotesTable = `
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  object TEXT,
  valid_until DATE,
  notes TEXT,
  original_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index pour améliorer les performances
CREATE INDEX idx_quotes_company_id ON quotes(company_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_number ON quotes(number);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view quotes for their companies" ON quotes
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all quotes" ON quotes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
`;

const createPaymentsTable = `
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Trigger pour updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies similaires aux invoices
CREATE POLICY "Users can view payments for their invoices" ON payments
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE company_id IN (
        SELECT id FROM companies 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admin can manage all payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
`;

// Fonction pour exécuter le SQL
async function executeSql(sql, tableName) {
  try {
    // Supabase n'a pas de méthode directe pour exécuter du SQL brut
    // On doit utiliser une Edge Function ou le dashboard
    console.log(chalk.yellow(`\n📝 SQL pour créer la table ${tableName}:`));
    console.log(chalk.gray('----------------------------------------'));
    console.log(chalk.white(sql));
    console.log(chalk.gray('----------------------------------------'));
    console.log(chalk.blue(`\nCopiez ce SQL dans l'éditeur SQL de Supabase Dashboard:`));
    console.log(chalk.blue(`https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw/sql/new`));
  } catch (error) {
    console.log(chalk.red(`❌ Erreur: ${error.message}`));
  }
}

// Créer des données de test pour quotes
async function seedQuotes() {
  console.log(chalk.cyan('\n🌱 Création de devis de test...\n'));
  
  const companies = [
    '672b96cf-68a5-4b09-93f5-1dd62cbef988', // Orange SA
    '67f6b00f-4c0d-4d37-b215-eb5a4dd0a3f2', // Sonatel
    'a48a5e5a-5e3d-4b3f-b3e4-8a2a6c8f5d4e'  // Terangacloud
  ];
  
  for (let i = 1; i <= 10; i++) {
    const quote = {
      number: `DEVIS-2025-${String(i).padStart(4, '0')}`,
      company_id: companies[i % companies.length],
      amount: Math.floor(Math.random() * 100000) + 10000,
      status: ['draft', 'sent', 'accepted', 'rejected'][i % 4],
      object: `Devis pour projet ${i}`,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: `Notes du devis ${i}`
    };
    
    console.log(chalk.gray(`INSERT INTO quotes: ${quote.number}`));
  }
}

// Menu principal
console.log(chalk.yellow('\n⚠️  IMPORTANT: Les tables doivent être créées via le Dashboard Supabase\n'));

await executeSql(createQuotesTable, 'quotes');
await executeSql(createPaymentsTable, 'payments');

console.log(chalk.green('\n✅ Scripts SQL générés avec succès!'));
console.log(chalk.cyan('\nÉtapes suivantes:'));
console.log('1. Ouvrez le dashboard Supabase');
console.log('2. Allez dans SQL Editor');
console.log('3. Copiez et exécutez chaque script SQL');
console.log('4. Relancez "node scripts/supabase-direct-queries.mjs tables" pour vérifier');

// Afficher aussi le code pour insérer des devis
console.log(chalk.cyan('\n📝 Après création des tables, vous pourrez insérer des devis avec:'));
await seedQuotes();