-- Ajouter le support SMS aux préférences de notifications
ALTER TABLE public.notification_preferences 
ADD COLUMN sms_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN phone_number text;