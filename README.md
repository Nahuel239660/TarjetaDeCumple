# Nahuel Birthday Night

Una invitación editorial para un cumpleaños nocturno y un panel privado para administrar confirmaciones, contenidos, imágenes y la logística del evento.

**Stack:** Next.js App Router · React · TypeScript estricto · PostgreSQL en Neon · Drizzle ORM · Vercel

[Ver sitio en vivo](https://tarjeta-de-cumple.vercel.app)

## Producto

La experiencia pública mantiene el tono de una invitación de club: una narrativa visual de dos paradas, mapa de Peatonal, RSVP integrado y confirmación clara. El back office está pensado para operar la lista real del evento, no como una maqueta administrativa.

### Invitación pública

- RSVP con Peatonal, Key, +1 condicional y comentario opcional.
- Detección de respuestas con nombres equivalentes, con confirmación explícita antes de aceptar un duplicado.
- Mapa ligero con enlace de indicaciones, sin API paga.
- Tres assets independientes: Nahuel, Fernet y Kevin de Vries.
- Estado de éxito accesible con resumen de la respuesta.

### Administración privada

- Acceso protegido por contraseña y sesión HTTP-only.
- Métricas derivadas de invitados reales, incluido el headcount con acompañantes.
- Lista densa con búsqueda, filtros, orden, edición, borrado y exportación CSV.
- Número visible inmutable (`#001`, `#002`, …), independiente del ID interno y nunca reutilizado.
- Edición de textos de la invitación, bloques personalizados, imágenes y ubicaciones.
- Configuración de Peatonal/Key y estado de QR; QR permanece desactivado por defecto.

## Arquitectura

```text
Next.js App Router
├── Invitación pública (/)
├── Admin protegido (/admin/*)
│   ├── Resumen
│   ├── Invitados
│   ├── Invitación
│   ├── Imágenes
│   └── Configuración
├── Server Actions validadas con Zod
├── Repositorio de eventos desacoplado de la UI
└── Neon Postgres + Drizzle
```

La UI no accede a la base directamente. Las Server Actions validan la entrada y delegan en un repositorio del servidor, lo que mantiene el reemplazo de la capa de persistencia acotado.

## Desarrollo local

### Requisitos

- Node.js 20+
- pnpm 11+
- Una base Neon Postgres (plan Free es suficiente)

```bash
pnpm install
cp .env.example .env.local
```

Variables necesarias en `.env.local`:

```env
DATABASE_URL=
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
```

Generá el hash de acceso:

```bash
pnpm password:hash -- "una contraseña larga"
```

Usá la salida como `ADMIN_PASSWORD_HASH` y generá `SESSION_SECRET` con al menos 32 caracteres, por ejemplo `openssl rand -base64 32`.

> En `.env.local`, escapá cada `$` del hash bcrypt como `\$`; Next expande variables de entorno locales. En Vercel cargá el hash original, sin escapes.

Después aplicá el esquema y la configuración inicial:

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Abrí `http://localhost:3000`. El acceso al panel está disponible desde el botón **Administrar** del pie de página o en `/admin`.

## Datos y migraciones

```bash
pnpm db:generate   # crea una migración desde el schema
pnpm db:migrate    # aplica las migraciones
pnpm db:seed       # solo configuración inicial; nunca crea RSVP falsos
pnpm db:seed:dev   # crea los datos de muestra, solo fuera de producción
```

El seed de producción es idempotente donde corresponde: configura contenido, ubicación, metadatos de imágenes, bloques y QR desactivado. Los invitados empiezan vacíos. `db:seed:dev` falla en producción y también si la base ya contiene invitados.

## Calidad

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Se preservan focus visibles, formularios semánticos, navegación por teclado, tabla con scroll horizontal en mobile y preferencias de movimiento reducido.

## Despliegue en Vercel

El proyecto está preparado para Vercel Hobby y Neon Free; no requiere dominio propio ni servicios pagos.

1. Conectá una base Neon al proyecto de Vercel o agregá `DATABASE_URL` manualmente.
2. Cargá en Production y Preview: `DATABASE_URL`, `ADMIN_PASSWORD_HASH` y `SESSION_SECRET`.
3. Ejecutá `pnpm db:migrate` y `pnpm db:seed` con la URL de esa base.
4. Desplegá con Vercel.

Nunca subas `.env.local`, hashes, secretos de sesión ni URLs de bases privadas. Los artefactos locales de Codex y la configuración local de Vercel también están excluidos del repositorio.

## Alcance actual

La primera entrega incluye persistencia real de RSVP y administración protegida. Quedan deliberadamente fuera: autenticación multiusuario, carga permanente de imágenes, generación/escaneo de QR, notificaciones y detección automática de duplicados.
