-- Migración: tabla de códigos OTP para recuperación de contraseña.
-- Aplicar en Supabase (SQL Editor) o vía psql con DIRECT_URL.
-- Después de aplicar: `npx prisma generate`.
--
-- ⚠️ No correr `npx prisma db pull` antes de aplicar este SQL: re-introspecta
--    desde la BD y borraría el modelo `password_resets` de schema.prisma.

create table if not exists public.password_resets (
  id           uuid        primary key default gen_random_uuid(),
  id_usuario   uuid        not null references public.usuarios(id) on delete cascade,
  codigo_hash  text        not null,                 -- scrypt salt:hash del OTP (nunca en claro)
  expira       timestamptz not null,
  intentos     int         not null default 0,
  verificado   boolean     not null default false,   -- true tras validar el OTP (paso 2)
  usado        boolean     not null default false,   -- true tras cambiar la contraseña (paso 3)
  creado       timestamptz not null default now()
);

create index if not exists idx_password_resets_id_usuario
  on public.password_resets (id_usuario);

-- Coherente con el resto del esquema (RLS habilitado).
alter table public.password_resets enable row level security;
