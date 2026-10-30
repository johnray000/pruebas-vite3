-- =====================================================================
-- Esquema de la base de datos de bexo.com.ve
-- Pegar completo en Supabase > SQL Editor > New query > Run
-- =====================================================================

-- Una sola tabla para todas las monedas: cada fila es una cotización
-- tomada por el runner. Las fechas "formateadas" (semana, dd/mm, "29 oct")
-- ya no se guardan: se calculan en el frontend a partir de `fecha`.
create table if not exists public.cotizaciones (
  id      bigint generated always as identity primary key,
  moneda  text        not null check (moneda in ('VES', 'ARS')),
  fuente  text        not null,                 -- 'yadio', 'criptoya_ccb', ...
  valor   numeric(14, 2) not null check (valor > 0),
  fecha   timestamptz not null default now(),
  unique (moneda, fecha)                         -- evita duplicados y sirve de índice
);

-- Seguridad: cualquiera puede LEER (la web es pública),
-- nadie puede escribir con la clave pública. El runner escribe con la
-- clave secreta, que ignora estas reglas y vive solo en GitHub Secrets.
alter table public.cotizaciones enable row level security;

drop policy if exists "lectura publica" on public.cotizaciones;
create policy "lectura publica"
  on public.cotizaciones
  for select
  to anon, authenticated
  using (true);

-- Vista con el ÚLTIMO valor de cada día por moneda (lo que usan los gráficos).
-- Así el navegador baja ~1 fila por día en vez de 3.
create or replace view public.cotizaciones_diarias
with (security_invoker = true) as
select distinct on (moneda, (fecha at time zone 'UTC')::date)
  moneda,
  valor,
  fecha,
  (fecha at time zone 'UTC')::date as dia
from public.cotizaciones
order by moneda, (fecha at time zone 'UTC')::date, fecha desc;

grant select on public.cotizaciones_diarias to anon, authenticated;
