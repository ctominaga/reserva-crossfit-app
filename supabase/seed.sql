-- =====================================================================
--  Reserva CrossFit — Seed inicial
--  Execute após schema.sql no SQL Editor do Supabase.
-- =====================================================================

insert into public.plans (name, price_monthly, features, is_highlighted) values
  ('Mensal',     199, ARRAY['Acesso ilimitado', 'App exclusivo', 'Suporte dos coaches'], false),
  ('Trimestral', 179, ARRAY['Acesso ilimitado', 'App exclusivo', 'Brinde oficial Reserva', '10% off loja parceira'], true),
  ('Anual',      159, ARRAY['Acesso ilimitado', 'App exclusivo', 'Brinde oficial Reserva', 'Análise física trimestral', '20% off loja parceira'], false)
on conflict do nothing;
