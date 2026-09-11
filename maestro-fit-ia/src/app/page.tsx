'use client';

import { useEffect, useState, useCallback } from 'react';
import { Flame, Camera, Plus, X, Settings } from 'lucide-react';
import type { Meal, MealType } from '@/lib/database.types';
import { todayLocalISODate, formatDateLong } from '@/lib/dates';
import { DEFAULT_GOALS } from '@/lib/goals';
import { DailyProgress } from '@/components/DailyProgress';
import { MealForm } from '@/components/MealForm';
import { MealList } from '@/components/MealList';
import { WeightTracker } from '@/components/WeightTracker';
import { PhotoAnalyzer, type PhotoEstimate } from '@/components/PhotoAnalyzer';
import { GoalsSettings } from '@/components/GoalsSettings';
import { WeeklySummary } from '@/components/WeeklySummary';

type PanelMode = 'none' | 'manual' | 'photo' | 'goals';

interface Goals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<PanelMode>('none');
  const [photoEstimate, setPhotoEstimate] = useState<PhotoEstimate | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);

  const today = todayLocalISODate();

  const loadMeals = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/meals?date=${today}`);
      if (!res.ok) throw new Error('No se pudieron cargar las comidas');
      const data = await res.json();
      setMeals(data.meals ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [today]);

  const loadGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) return;
      const data = await res.json();
      setGoals({
        calories: data.profile.daily_calories_goal,
        protein_g: data.profile.daily_protein_goal,
        carbs_g: data.profile.daily_carbs_goal,
        fat_g: data.profile.daily_fat_goal,
      });
    } catch {
      // keep defaults
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadMeals();
    loadGoals();
  }, [loadMeals, loadGoals]);

  const closePanel = () => {
    setPanel('none');
    setPhotoEstimate(null);
    setEditingMeal(null);
  };

  const handleSaveMeal = async (meal: {
    meal_type: MealType;
    description: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    source?: 'manual' | 'photo';
  }) => {
    if (editingMeal) {
      const res = await fetch(`/api/meals/${editingMeal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_type: meal.meal_type,
          description: meal.description,
          calories: meal.calories,
          protein_g: meal.protein_g,
          carbs_g: meal.carbs_g,
          fat_g: meal.fat_g,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'No se pudo actualizar la comida');
      }
      const data = await res.json();
      setMeals((prev) => prev.map((m) => (m.id === data.meal.id ? data.meal : m)));
      closePanel();
      return;
    }

    const res = await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...meal, logged_date: today, source: meal.source ?? 'manual' }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? 'No se pudo guardar la comida');
    }
    const data = await res.json();
    setMeals((prev) => [...prev, data.meal]);
    closePanel();
  };

  const handleDeleteMeal = async (id: string) => {
    const previous = meals;
    setMeals((prev) => prev.filter((m) => m.id !== id));
    const res = await fetch(`/api/meals/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setMeals(previous);
    }
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setPhotoEstimate(null);
    setPanel('manual');
  };

  const handleSaveGoals = async (newGoals: Goals) => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        daily_calories_goal: newGoals.calories,
        daily_protein_goal: newGoals.protein_g,
        daily_carbs_goal: newGoals.carbs_g,
        daily_fat_goal: newGoals.fat_g,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? 'No se pudieron guardar los objetivos');
    }
    setGoals(newGoals);
    setPanel('none');
  };

  if (!mounted) return null;

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein_g: acc.protein_g + Number(m.protein_g),
      carbs_g: acc.carbs_g + Number(m.carbs_g),
      fat_g: acc.fat_g + Number(m.fat_g),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-md px-4 py-8 sm:py-10">
        <header className="flex items-center gap-2.5 mb-7">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 text-white shrink-0">
            <Flame size={20} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-stone-900 dark:text-white leading-tight">Maestro Fit IA</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">Tu asistente de calorías</p>
          </div>
          <button
            onClick={() => setPanel(panel === 'goals' ? 'none' : 'goals')}
            aria-label="Ajustar objetivos"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Settings size={18} strokeWidth={2.25} />
          </button>
        </header>

        {panel === 'goals' && (
          <GoalsSettings goals={goals} onSave={handleSaveGoals} onCancel={() => setPanel('none')} />
        )}

        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-card border border-stone-200/70 dark:border-stone-800 p-6 mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 mb-5">
            Hoy — {formatDateLong(today)}
          </h2>

          <DailyProgress totals={totals} goals={goals} />

          <div className="flex gap-2.5 mt-6">
            <button
              onClick={() => {
                setPhotoEstimate(null);
                setEditingMeal(null);
                setPanel(panel === 'photo' ? 'none' : 'photo');
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors"
            >
              <Camera size={16} strokeWidth={2.25} />
              Analizar foto
            </button>
            <button
              onClick={() => {
                setPhotoEstimate(null);
                setEditingMeal(null);
                setPanel(panel === 'manual' ? 'none' : 'manual');
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors"
            >
              {panel === 'manual' ? (
                <>
                  <X size={16} strokeWidth={2.25} />
                  Cerrar
                </>
              ) : (
                <>
                  <Plus size={16} strokeWidth={2.25} />
                  Añadir a mano
                </>
              )}
            </button>
          </div>
        </div>

        {panel === 'photo' && (
          <PhotoAnalyzer
            onAnalyzed={(estimate) => {
              setPhotoEstimate(estimate);
              setPanel('manual');
            }}
            onCancel={() => setPanel('none')}
          />
        )}

        {panel === 'manual' && (
          <MealForm
            onSubmit={handleSaveMeal}
            onCancel={closePanel}
            title={editingMeal ? 'Editar comida' : 'Añadir comida'}
            submitLabel={editingMeal ? 'Guardar cambios' : 'Guardar comida'}
            initialValues={
              editingMeal
                ? {
                    meal_type: editingMeal.meal_type,
                    description: editingMeal.description,
                    calories: editingMeal.calories,
                    protein_g: Number(editingMeal.protein_g),
                    carbs_g: Number(editingMeal.carbs_g),
                    fat_g: Number(editingMeal.fat_g),
                  }
                : photoEstimate
                  ? {
                      description: photoEstimate.description,
                      calories: photoEstimate.calories,
                      protein_g: photoEstimate.protein_g,
                      carbs_g: photoEstimate.carbs_g,
                      fat_g: photoEstimate.fat_g,
                    }
                  : undefined
            }
            hint={editingMeal ? null : photoEstimate?.question}
            source={photoEstimate ? 'photo' : 'manual'}
          />
        )}

        <WeeklySummary caloriesGoal={goals.calories} />

        <WeightTracker />

        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-card border border-stone-200/70 dark:border-stone-800 p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 mb-4">
            Comidas de hoy
          </h3>

          {loading && <p className="text-stone-500 dark:text-stone-400 text-sm">Cargando...</p>}
          {loadError && <p className="text-red-600 dark:text-red-400 text-sm">{loadError}</p>}
          {!loading && !loadError && (
            <MealList meals={meals} onDelete={handleDeleteMeal} onEdit={handleEditMeal} />
          )}
        </div>

        <p className="text-center text-stone-400 dark:text-stone-600 text-xs mt-8">
          MVP v0.4 — foto + IA, edición, objetivos, resumen semanal y peso
        </p>
      </div>
    </main>
  );
}
