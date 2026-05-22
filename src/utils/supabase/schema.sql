-- Extension UUID
create extension if not exists "uuid-ossp";

-- Table des Clients
create table public."Client" (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  nom_entreprise text not null,
  nom_contact text,
  email text not null,
  adresse text,
  avatar_bg text default 'bg-slate-100 text-slate-500',
  avatar_text text default 'text-slate-500',
  initials varchar(2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table des Factures
create table public."Facture" (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  client_id uuid references public."Client"(id) on delete cascade not null,
  service text not null,
  montant numeric(12, 2) not null check (montant >= 0),
  statut_paiement text not null check (statut_paiement in ('Terminé', 'En attente', 'En retard')),
  date_emission date not null default current_date,
  heure_emission time without time zone not null default current_time,
  jours_retard integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table des Devis
create table public."Devis" (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  client_id uuid references public."Client"(id) on delete cascade not null,
  service text not null,
  montant numeric(12, 2) not null check (montant >= 0),
  statut text not null check (statut in ('Brouillon', 'Envoyé', 'Accepté', 'Refusé')),
  date_emission date not null default current_date,
  date_validite date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger pour la mise à jour automatique de updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_client_updated_at before update on public."Client" for each row execute procedure public.handle_updated_at();
create trigger set_facture_updated_at before update on public."Facture" for each row execute procedure public.handle_updated_at();
create trigger set_devis_updated_at before update on public."Devis" for each row execute procedure public.handle_updated_at();

-- Activation de RLS (Row Level Security) pour se prémunir des failles IDOR
alter table public."Client" enable row level security;
alter table public."Facture" enable row level security;
alter table public."Devis" enable row level security;

-- Politiques de sécurité (RLS Policies)
-- L'utilisateur ne peut voir ou modifier que les lignes associées à son user_id (auth.uid())

-- Client Policies
create policy "Les utilisateurs authentifiés peuvent tout faire sur leurs propres clients"
on public."Client" for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Facture Policies
create policy "Les utilisateurs authentifiés peuvent tout faire sur leurs propres factures"
on public."Facture" for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Devis Policies
create policy "Les utilisateurs authentifiés peuvent tout faire sur leurs propres devis"
on public."Devis" for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
