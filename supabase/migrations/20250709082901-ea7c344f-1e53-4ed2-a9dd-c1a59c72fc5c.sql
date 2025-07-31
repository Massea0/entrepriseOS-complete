-- Activer Realtime pour les tables de notifications
-- Ajouter les tables à la publication realtime

-- Ajouter les tables à la publication supabase_realtime
ALTER publication supabase_realtime ADD TABLE public.notifications;
ALTER publication supabase_realtime ADD TABLE public.notification_channels;