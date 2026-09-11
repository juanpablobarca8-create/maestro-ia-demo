'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Meal, MealType } from '@/lib/database.types';
import { todayLocalISODate, formatDateLong } from '@/lib/dates';
import { DailyProgress } from '@/components/DailyProgress';
import { MealForm } from '@/components/MealForm';
import { MealList } from '@/components/MealList';
import { WeightTracker } from '@/components/WeightTracker';
import { PhotoAnalyzer, type PhotoEstimate } from '@/components/PhotoAnalyzer';

type PanelMode = 'none' | 'manual' | 'photo';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<PanelMode>('none');
  const [photoEstimate, setPhotoEstimate] = useState<PhotoEstimate | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  useEffect(() => {
    setMounted(true);
    loadMeals();
  }, [loadMeals]);

  const handleAddMeal = async (meal: {
    meal_type: MealType;
    description: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    source?: 'manual' | 'photo';
  }) => {
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
    setPanel('none');
    setPhotoEstimate(null);
  };

  const handleDeleteMeal = async (id: string) => {
    const previous = meals;
    setMeals((prev) => prev.filter((m) => m.id !== id));
    const res = await fetch(`/api/meals/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setMeals(previous);
    }
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto max-w-md px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">🔥 Maestro Fit IA</h1>
          <p className="text-slate-600 dark:text-slate-400">Tu asistente de calorías inteligente</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">
            Hoy — {formatDateLong(today)}
          </h2>

          <DailyProgress totals={totals} />

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setPhotoEstimate(null);
                setPanel(panel === 'photo' ? 'none' : 'photo');
              }}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
            >
              📸 Analizar foto
            </button>
            <button
              onClick={() => {
                setPhotoEstimate(null);
                setPanel(panel === 'manual' ? 'none' : 'manual');
              }}
              className="flex-1 border border-orange-500 text-orange-600 dark:text-orange-400 font-semibold py-3 px-4 rounded-lg transition-all"
            >
              {panel === 'manual' ? 'Cerrar' : '➕ Añadir a mano'}
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
            onSubmit={handleAddMeal}
            onCancel={() => {
              setPanel('none');
              setPhotoEstimate(null);
            }}
            initialValues={
              photoEstimate
                ? {
                    description: photoEstimate.description,
                    calories: photoEstimate.calories,
                    protein_g: photoEstimate.protein_g,
                    carbs_g: photoEstimate.carbs_g,
                    fat_g: photoEstimate.fat_g,
                  }
                : undefined
            }
            hint={photoEstimate?.question}
            source={photoEstimate ? 'photo' : 'manual'}
          />
        )}

        <WeightTracker />

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Comidas de hoy</h3>

          {loading && <p className="text-slate-500 dark:text-slate-400 text-sm">Cargando...</p>}
          {loadError && <p className="text-red-600 text-sm">{loadError}</p>}
          {!loading && !loadError && <MealList meals={meals} onDelete={handleDeleteMeal} />}
        </div>

        <div className="text-center text-slate-500 dark:text-slate-500 text-xs mt-8">
          <p>MVP v0.2 — foto + IA, entrada manual, peso y contador diario</p>
        </div>
      </div>
    </main>
  );
}
