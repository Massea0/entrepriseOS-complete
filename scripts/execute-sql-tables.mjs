#!/usr/bin/env node
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log(chalk.cyan.bold('\n📋 Script SQL pour créer les tables manquantes\n'));

// Lire le fichier SQL
const sqlFile = path.join(__dirname, 'create-onboarding-tables.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

console.log(chalk.yellow('⚠️  INSTRUCTIONS IMPORTANTES:'));
console.log('1. Ouvrez le dashboard Supabase');
console.log('2. Allez dans SQL Editor');
console.log('3. Créez une nouvelle requête');
console.log('4. Copiez-collez le SQL ci-dessous');
console.log('5. Exécutez la requête\n');

console.log(chalk.blue('🔗 Lien direct:'));
console.log(chalk.blue.underline('https://supabase.com/dashboard/project/qlqgyrfqiflnqknbtycw/sql/new\n'));

console.log(chalk.gray('═'.repeat(80)));
console.log(chalk.white('-- DÉBUT DU SQL --\n'));
console.log(sqlContent);
console.log(chalk.white('\n-- FIN DU SQL --'));
console.log(chalk.gray('═'.repeat(80)));

console.log(chalk.green('\n✅ Actions après exécution:'));
console.log('1. Vérifier que toutes les tables sont créées');
console.log('2. Tester l\'onboarding sur /onboarding');
console.log('3. Vérifier les données dans la table onboarding_submissions');

// Créer aussi un fichier de données de test
const testDataSQL = `
-- =====================================================
-- DONNÉES DE TEST POUR LES NOUVELLES TABLES
-- =====================================================

-- Insérer des devis de test
INSERT INTO quotes (number, company_id, amount, tax_amount, currency, status, object, valid_until, line_items, payment_terms, created_by)
SELECT 
  'DEVIS-2025-' || LPAD(generate_series::text, 4, '0'),
  c.id,
  (random() * 100000 + 10000)::decimal(12,2),
  (random() * 10000)::decimal(12,2),
  'XOF',
  CASE 
    WHEN random() < 0.3 THEN 'draft'
    WHEN random() < 0.6 THEN 'sent'
    WHEN random() < 0.8 THEN 'accepted'
    ELSE 'rejected'
  END,
  'Devis pour projet ' || generate_series,
  CURRENT_DATE + interval '30 days',
  '[{"description": "Service principal", "quantity": 1, "unit_price": 50000, "total": 50000}]'::jsonb,
  'Paiement à 30 jours',
  u.id
FROM generate_series(1, 10)
CROSS JOIN (SELECT id FROM companies LIMIT 3) c
CROSS JOIN (SELECT id FROM users WHERE role = 'admin' LIMIT 1) u;

-- Insérer des paiements de test
INSERT INTO payments (invoice_id, amount, currency, payment_date, payment_method, reference, status, notes, created_by)
SELECT 
  i.id,
  i.amount,
  'XOF',
  CURRENT_DATE - interval '1 day' * (random() * 30)::int,
  CASE (random() * 4)::int
    WHEN 0 THEN 'bank_transfer'
    WHEN 1 THEN 'check'
    WHEN 2 THEN 'mobile_money'
    ELSE 'card'
  END,
  'PAY-' || generate_series(1000, 1000 + count(*) OVER ()),
  'completed',
  'Paiement reçu',
  u.id
FROM invoices i
CROSS JOIN (SELECT id FROM users WHERE role = 'admin' LIMIT 1) u
WHERE i.status = 'paid'
LIMIT 5;

-- Insérer des offres d'emploi de test
INSERT INTO job_postings (title, description, requirements, responsibilities, benefits, employment_type, experience_level, salary_range_min, salary_range_max, location, remote_allowed, status, created_by)
VALUES 
  ('Développeur Full Stack Senior', 
   'Nous recherchons un développeur full stack expérimenté pour rejoindre notre équipe dynamique.', 
   '["5 ans d''expérience minimum", "Maîtrise de React et Node.js", "Expérience avec les bases de données SQL", "Français et anglais courants"]'::jsonb,
   '["Développer de nouvelles fonctionnalités", "Maintenir le code existant", "Participer aux revues de code", "Mentorer les juniors"]'::jsonb,
   '["Salaire compétitif", "Télétravail flexible", "Formation continue", "Assurance santé"]'::jsonb,
   'full_time', 'senior', 8000000, 12000000, 'Dakar, Sénégal', true, 'published',
   (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
   
  ('Designer UX/UI', 
   'Créez des expériences utilisateur exceptionnelles pour nos produits innovants.', 
   '["3 ans d''expérience en design", "Portfolio impressionnant", "Maîtrise de Figma", "Connaissance des principes UX"]'::jsonb,
   '["Concevoir des interfaces", "Créer des prototypes", "Collaborer avec les développeurs", "Tests utilisateurs"]'::jsonb,
   '["Environnement créatif", "Projets variés", "Équipe internationale", "Budget formation"]'::jsonb,
   'full_time', 'mid', 4000000, 6000000, 'Dakar, Sénégal', true, 'published',
   (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
   
  ('Chef de Projet Digital', 
   'Pilotez des projets innovants de transformation digitale pour nos clients prestigieux.', 
   '["Certification PMP ou équivalent", "5 ans d''expérience en gestion de projet", "Connaissance Agile/Scrum", "Leadership confirmé"]'::jsonb,
   '["Gérer des projets de A à Z", "Coordonner les équipes", "Relation client", "Reporting et suivi"]'::jsonb,
   '["Véhicule de fonction", "Prime sur objectifs", "Télétravail partiel", "Évolution rapide"]'::jsonb,
   'full_time', 'senior', 10000000, 15000000, 'Dakar, Sénégal', false, 'published',
   (SELECT id FROM users WHERE role = 'admin' LIMIT 1));

-- Insérer des candidatures de test
INSERT INTO job_applications (job_posting_id, first_name, last_name, email, phone, current_position, current_company, years_experience, status, rating, source)
SELECT 
  jp.id,
  CASE (random() * 5)::int
    WHEN 0 THEN 'Amadou'
    WHEN 1 THEN 'Fatou'
    WHEN 2 THEN 'Ibrahima'
    WHEN 3 THEN 'Aissatou'
    ELSE 'Mamadou'
  END,
  CASE (random() * 5)::int
    WHEN 0 THEN 'Ndiaye'
    WHEN 1 THEN 'Diop'
    WHEN 2 THEN 'Fall'
    WHEN 3 THEN 'Seck'
    ELSE 'Ba'
  END,
  'candidat' || generate_series || '@email.com',
  '+221 77 ' || (100 + random() * 900)::int || ' ' || (10 + random() * 90)::int || ' ' || (10 + random() * 90)::int,
  'Développeur',
  'Entreprise ' || generate_series,
  (2 + random() * 8)::int,
  CASE (random() * 4)::int
    WHEN 0 THEN 'new'
    WHEN 1 THEN 'screening'
    WHEN 2 THEN 'interview'
    ELSE 'rejected'
  END,
  (1 + random() * 4)::int,
  CASE (random() * 3)::int
    WHEN 0 THEN 'LinkedIn'
    WHEN 1 THEN 'Site web'
    ELSE 'Référence'
  END
FROM job_postings jp
CROSS JOIN generate_series(1, 5);

COMMIT;
`;

console.log(chalk.cyan('\n\n📊 Données de test (optionnel):'));
console.log(chalk.yellow('Après avoir créé les tables, vous pouvez exécuter ce SQL pour ajouter des données de test:\n'));
console.log(chalk.gray('═'.repeat(80)));
console.log(testDataSQL);
console.log(chalk.gray('═'.repeat(80)));

console.log(chalk.green('\n✅ Terminé!'));