/*
  # Create PDF logs table

  1. New Tables
    - `pdf_logs`
      - `id` (uuid, primary key) - Unique identifier for each PDF generation
      - `user_email` (text, not null) - Email of user who generated PDF
      - `created_at` (timestamptz, not null, default now()) - When PDF was generated

  2. Security
    - Enable RLS on `pdf_logs` table
    - Add policy for authenticated users to insert their own logs
    - Add policy for authenticated users to read their own logs

  3. Indexes
    - Composite index on (user_email, created_at) for efficient monthly cap queries

  4. Purpose
    - Track PDF generation for enforcing Starter plan limits (5 per month)
*/

create table if not exists pdf_logs (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  created_at timestamptz not null default now()
);

alter table pdf_logs enable row level security;

create policy "Users can insert own PDF logs"
  on pdf_logs
  for insert
  to authenticated
  with check (auth.jwt() ->> 'email' = user_email);

create policy "Users can read own PDF logs"
  on pdf_logs
  for select
  to authenticated
  using (auth.jwt() ->> 'email' = user_email);

create index if not exists pdf_logs_email_created_idx on pdf_logs (user_email, created_at);
