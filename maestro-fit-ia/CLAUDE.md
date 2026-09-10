# Maestro Fit IA

Aplicación web para tracking de calorías y macros con análisis de IA.

## MVP Scope

**Fase 1** (actual, funcionando):
- Entrada manual de comidas ("2 huevos, tostada integral")
- Estimación de calorías/macros por IA a partir del texto (OpenAI gpt-4o-mini)
- Contador diario: kcal, proteína, hidratos, grasas
- Guardar/listar/borrar comidas (Supabase, single-user)

**Fase 2** (después):
- Histórico de peso
- Foto → análisis IA (visión — proveedor por decidir)
- Preguntas de corrección automáticas
- Escáner de códigos de barras
- Recomendaciones de cenas
- Integración con Apple Health
- Auth real (Supabase Auth) — ver nota en supabase/migrations/0001_init.sql

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL, single-user MVP — sin auth todavía)
- **AI**: OpenAI gpt-4o-mini para estimación de calorías por texto
- **Deployment**: Vercel (PWA)

## Running Locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
DEFAULT_USER_ID=00000000-0000-0000-0000-000000000001
```

## Database Schema

Ver `supabase/migrations/0001_init.sql` — tablas `meals`, `weight_logs`, `profiles` con RLS.

## API Routes

- `POST /api/meals` — guardar comida
- `GET /api/meals?date=2025-09-10` — listar comidas del día
- `DELETE /api/meals/[id]` — borrar comida
- `POST /api/weight` / `GET /api/weight` — histórico de peso
- `POST /api/estimate` — estimar calorías/macros a partir de una descripción de texto

## Key Features

- Offline-first PWA (datos locales primero, sync con BD)
- Single-question UX para correcciones de IA
- Soporte dark mode
- Responsive mobile-first
