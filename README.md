# Tarjeta de cumple

Invitación pública y panel privado de gestión para el cumpleaños de Nahuel.
Funciona con Next.js, Neon Postgres y Vercel Hobby, sin servicios pagos.

## Requisitos

- Node.js 20+
- pnpm 11+
- Una base Neon Postgres Free conectada desde Vercel

## Instalación local

```bash
pnpm install
cp .env.example .env.local
```

Completá `.env.local` con valores locales; nunca subas ese archivo al repositorio.

```bash
pnpm password:hash -- "una contraseña larga"
```

Usá la salida como `ADMIN_PASSWORD_HASH`. Generá `SESSION_SECRET` con un valor aleatorio de al menos 32 caracteres (por ejemplo, `openssl rand -base64 32`).

En `.env.local`, escapá cada signo `$` del hash bcrypt como `\$`; Next expande variables de entorno locales y, sin ese escape, alteraría el hash. En Vercel cargá el hash original, sin escapes.

## Base de datos Neon

1. En el dashboard del proyecto de Vercel abrí **Storage** → **Create Database**.
2. Elegí **Neon Postgres** y seleccioná el plan **Free**.
3. Conectalo al proyecto; Vercel agrega `DATABASE_URL` automáticamente para los despliegues.
4. Copiá la URL de desarrollo a tu `.env.local`.
5. Ejecutá las migraciones y los datos iniciales:

```bash
pnpm db:migrate
pnpm db:seed
```

El seed de producción es seguro de repetir: crea únicamente la configuración singleton, Peatonal/Key, las tres referencias de imagen, bloques de contenido y QR desactivado cuando faltan. **No crea invitados ni RSVP de muestra.** Los nuevos números visibles de invitados los genera Postgres y nunca se reciclan tras un borrado.

Para poblar una base local de desarrollo vacía con los 64 invitados usados durante Phase 1, ejecutá explícitamente:

```bash
pnpm db:seed:dev
```

Ese comando se bloquea con `NODE_ENV=production` y también si la base ya tiene invitados, para no mezclar datos de ejemplo con RSVP reales.

## Desarrollo

```bash
pnpm dev
```

La invitación pública usa datos del servidor. El panel bajo `/admin` redirige a `/admin/login` hasta iniciar sesión. No existe registro de usuarios ni proveedores externos de autenticación.

## Migraciones

```bash
pnpm db:generate
pnpm db:migrate
```

`db:generate` crea una migración a partir del schema Drizzle. Versioná los archivos en `drizzle/` junto al cambio de schema. `db:migrate` requiere `DATABASE_URL`.

## Imágenes

Las tres imágenes finales viven en `public/images/` y se versionan con el proyecto. En Phase 2 el gestor persiste título, caption, visibilidad y referencia de archivo; el selector de reemplazo solo muestra una vista previa local y temporal. La carga permanente de archivos queda diferida.

## Deploy gratuito en Vercel

1. Importá el repositorio en Vercel y dejá seleccionado **Hobby**.
2. Conectá Neon desde **Storage** usando exclusivamente **Free**.
3. En **Settings** → **Environment Variables**, agregá para Production y Preview:
   - `ADMIN_PASSWORD_HASH`
   - `SESSION_SECRET`
4. Confirmá que `DATABASE_URL` fue creada por la integración Neon.
5. Corré `pnpm db:migrate` una vez con esa URL antes del primer uso, o desde una terminal local con la variable configurada.
6. Desplegá usando el dominio gratuito `*.vercel.app`.

No se requiere dominio propio, mapa pago, Blob, workers, cron, analítica paga ni plan Vercel/Neon pago.
