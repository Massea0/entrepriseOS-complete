-- Migration pour nettoyer les anciennes données test et garder les nouvelles données réalistes
-- Attention: Cette migration va supprimer TOUTES les données existantes

-- Désactiver temporairement les contraintes de clés étrangères pour faciliter la suppression
SET session_replication_role = replica;

-- Supprimer les données dans l'ordre des dépendances (enfants d'abord)
DELETE FROM public.invoice_items;
DELETE FROM public.devis_items;
DELETE FROM public.task_assignments_history;
DELETE FROM public.task_assignment_suggestions;
DELETE FROM public.ai_support_responses;
DELETE FROM public.support_notifications;
DELETE FROM public.contract_alerts;
DELETE FROM public.contract_obligations;
DELETE FROM public.payment_predictions;
DELETE FROM public.payment_transactions;
DELETE FROM public.quote_optimizations;
DELETE FROM public.client_behavior_analysis;
DELETE FROM public.client_activity_logs;
DELETE FROM public.ai_alerts;
DELETE FROM public.ai_tasks_log;

-- Supprimer les données principales
DELETE FROM public.tasks;
DELETE FROM public.projects;
DELETE FROM public.contracts;
DELETE FROM public.invoices;
DELETE FROM public.devis;
DELETE FROM public.tickets;
DELETE FROM public.employees;
DELETE FROM public.support_agents;

-- Supprimer les données de structure organisationnelle
DELETE FROM public.positions;
DELETE FROM public.departments;
DELETE FROM public.branches;

-- Supprimer les entreprises et utilisateurs (sauf les comptes admin essentiels)
DELETE FROM public.users WHERE role != 'admin' AND email != 'admin@arcadis.tech';
DELETE FROM public.companies;

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- Réinitialiser les séquences si nécessaire
-- (Les UUID n'ont pas de séquences, donc pas besoin)

-- Message de confirmation
SELECT 'Anciennes données supprimées. Prêt pour les nouvelles données réalistes.' as status;