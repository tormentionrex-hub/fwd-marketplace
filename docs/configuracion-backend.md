# Configuración del backend (Prisma + base de datos)

Guía rápida para dejar el backend funcionando, pensada para quien **no haya tocado Prisma** antes. Seguí los pasos en orden.

## 1. El archivo `.env`

Las credenciales reales viven en `.env`, que **se compartió en el grupo como documento**.

1. Descargá el `.env` del grupo.
2. Colocalo en la raíz del proyecto: `fwd-marketplace/.env`.

> **¿No lo encontrás?** Pedíselo a un compañero del equipo — ahí está el acceso a la base de datos.

El `.env` **nunca** se commitea (está en `.gitignore`). Si querés ver qué variables lleva (sin valores), mirá `.env.example`.

## 2. Instalar dependencias

```bash
npm install
```

## 3. Sincronizar Prisma con la BD

Estos dos comandos dejan el backend listo para hablar con la base de datos:

```bash
npx prisma db pull    # trae el esquema actual de la BD a prisma/schema.prisma
npx prisma generate   # genera el cliente Prisma que importa el backend
```

- **`db pull`** lee la estructura real de la BD (tablas, columnas) usando `DIRECT_URL` del `.env` y la vuelca en `prisma/schema.prisma`.
- **`generate`** crea el cliente tipado (`@prisma/client`) que usa el código en `src/server/`.

Cada vez que cambie el esquema de la base de datos, volvé a correr estos dos pasos.

## 4. Probar y arrancar

```bash
node test-db.js   # confirma que conecta a la BD
npm run dev       # levanta la app en http://localhost:3000  (redirige a /es)
```

## Problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `tenant/user not found` / no conecta | El host del pooler (`aws-N`) del `.env` está mal | Ver *Troubleshooting Supabase* en el [README](../README.md#troubleshooting-supabase) |
| `@prisma/client did not initialize yet` | Faltó generar el cliente | Correr `npx prisma generate` |
| Faltan credenciales / no tengo `.env` | No descargaste el documento del grupo | Pedíselo a un compañero (paso 1) |
