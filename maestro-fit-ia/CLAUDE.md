# Maestro Fit IA

Aplicación web para tracking de calorías y macros con análisis de IA.

## MVP Scope

**Fase 1** (actual):
- Entrada manual de comidas ("2 huevos, tostada integral")
- Contador diario: kcal, proteína, hidratos, grasas
- Histórico de peso
- Guardar a BD (Supabase)
- PWA instalable en iPhone

**Fase 2** (después):
- Foto → análisis IA (visión Claude)
- Preguntas de corrección automáticas
- Escáner de códigos de barras
- Recomendaciones de cenas
- Integración con Apple Health

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude (Haiku) para visión en fase 2
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
ANTHROPIC_API_KEY=
```

## Database Schema (TODO)

- `users` — id, email, weight, daily_calories_goal
- `meals` — id, user_id, date, name, calories, protein, carbs, fat
- `weight_logs` — id, user_id, date, weight_kg

## API Routes (TODO)

- `POST /api/meals` — guardar comida
- `GET /api/meals?date=2025-09-10` — listar comidas del día
- `POST /api/weight` — registrar peso
- `POST /api/analyze` — analizar imagen (fase 2)

## Key Features

- Offline-first PWA (datos locales primero, sync con BD)
- Single-question UX para correcciones de IA
- Soporte dark mode
- Responsive mobile-first
