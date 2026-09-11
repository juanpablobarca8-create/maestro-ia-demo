# Maestro Fit IA

Aplicación web (PWA) para tracking de calorías y macros con IA, multi-usuario.

## Funcionalidades (todas activas)

- Login/registro con email + contraseña (Supabase Auth) — cada usuario ve solo sus propios datos
- Entrada manual de comidas, con edición y borrado
- Estimación de calorías/macros por IA a partir de texto (OpenAI gpt-4o-mini)
- Análisis de foto de un plato (visión, OpenAI gpt-4o-mini) — identifica alimentos, estima macros, pregunta si hay ambigüedad relevante (frito/horno, cantidad de aceite)
- Objetivos diarios personalizables (calorías/proteína/hidratos/grasas) por usuario
- Sugerencia de cena por IA según lo que queda del día
- Resumen semanal con gráfico de calorías (7 días) vs objetivo
- Histórico de peso con delta respecto al registro anterior

**Pendiente / ideas futuras**: escáner de código de barras, integración con Apple Health, marca blanca por negocio/gimnasio.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Auth**: Supabase Auth (email/contraseña) vía `@supabase/ssr` — sesión en cookies, `src/middleware.ts` protege las rutas y refresca la sesión
- **Backend**: Next.js Route Handlers, todos con Supabase (RLS respetada — el cliente por request usa la sesión del usuario, no una service-role key)
- **Database**: Supabase (PostgreSQL) — `meals`, `weight_logs`, `profiles`, todo con RLS por `auth.uid()`
- **AI**: OpenAI gpt-4o-mini (texto y visión)
- **Deployment**: Vercel (PWA)

## Running Locally

```bash
npm install
npm run dev
# Open http://localhost:3000 — redirige a /login si no hay sesión
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
```

## Database Schema

Ver `supabase/migrations/`. `0001_init.sql` crea las tablas base (originalmente sin FK a `auth.users`, para el MVP mono-usuario). Al pasar a multi-usuario:

- Los usuarios ya se crean en `auth.users` vía Supabase Auth (signup)
- Los datos de prueba del usuario mono-usuario original (`user_id` fijo `00000000-0000-0000-0000-000000000001`) se migraron a mano al primer usuario real
- Las políticas RLS ya usaban `auth.uid() = user_id`, así que funcionan sin cambios — solo dejaron de bypassearse porque las rutas ya no usan una service-role key

## API Routes

Todas requieren sesión autenticada (401 si no la hay):

- `POST /api/meals` / `GET /api/meals?date=` — crear / listar comidas del día
- `PATCH /api/meals/[id]` / `DELETE /api/meals/[id]` — editar / borrar una comida
- `GET /api/meals/summary?from=&to=` — totales por día en un rango (resumen semanal)
- `POST /api/weight` / `GET /api/weight` — histórico de peso
- `GET /api/profile` / `PUT /api/profile` — objetivos diarios del usuario
- `POST /api/estimate` — estimar calorías/macros desde texto
- `POST /api/analyze-photo` — estimar calorías/macros desde una foto
- `POST /api/suggest-dinner` — sugerencia de cena según lo que queda del día

## Key Features

- Multi-usuario real, aislamiento de datos por RLS
- Soporte dark mode, diseño mobile-first (Inter, iconos lucide-react)
- PWA instalable en iPhone/Android
