'use client';

import { useState, FormEvent } from 'react';
import type { MealType } from '@/lib/database.types';
import { MEAL_TYPE_LABELS } from '@/lib/goals';

interface MealFormInitialValues {
  description?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}

interface MealFormProps {
  onSubmit: (meal: {
    meal_type: MealType;
    description: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    source?: 'manual' | 'photo';
  }) => Promise<void>;
  onCancel: () => void;
  initialValues?: MealFormInitialValues;
  hint?: string | null;
  source?: 'manual' | 'photo';
}

const MEAL_TYPES: MealType[] = ['desayuno', 'comida', 'merienda', 'cena', 'snack'];

export function MealForm({ onSubmit, onCancel, initialValues, hint, source = 'manual' }: MealFormProps) {
  const [mealType, setMealType] = useState<MealType>('comida');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [calories, setCalories] = useState(
    initialValues?.calories != null ? String(Math.round(initialValues.calories)) : ''
  );
  const [protein, setProtein] = useState(
    initialValues?.protein_g != null ? String(Math.round(initialValues.protein_g)) : ''
  );
  const [carbs, setCarbs] = useState(
    initialValues?.carbs_g != null ? String(Math.round(initialValues.carbs_g)) : ''
  );
  const [fat, setFat] = useState(
    initialValues?.fat_g != null ? String(Math.round(initialValues.fat_g)) : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async () => {
    setError(null);
    if (!description.trim()) {
      setError('Escribe primero qué has comido');
      return;
    }

    setEstimating(true);
    try {
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'No se pudo estimar');
      }
      setCalories(String(Math.round(data.estimate.calories)));
      setProtein(String(Math.round(data.estimate.protein_g)));
      setCarbs(String(Math.round(data.estimate.carbs_g)));
      setFat(String(Math.round(data.estimate.fat_g)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo estimar');
    } finally {
      setEstimating(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError('Describe qué has comido');
      return;
    }
    if (calories.trim() === '') {
      setError('Introduce las calorías');
      return;
    }
    const caloriesNum = Number(calories);
    if (!Number.isFinite(caloriesNum) || caloriesNum <= 0) {
      setError('Introduce unas calorías válidas (mayor que 0)');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        meal_type: mealType,
        description: description.trim(),
        calories: Math.round(caloriesNum),
        protein_g: Number(protein) || 0,
        carbs_g: Number(carbs) || 0,
        fat_g: Number(fat) || 0,
        source,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6 space-y-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Añadir comida</h3>

      {hint && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
          🤔 {hint}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Tipo de comida
        </label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
        >
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {MEAL_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Qué has comido
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="2 huevos, tostada integral y Danone +Proteína"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
          maxLength={500}
        />
        <button
          type="button"
          onClick={handleEstimate}
          disabled={estimating || submitting}
          className="mt-2 text-sm font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {estimating ? 'Estimando...' : '✨ Estimar calorías con IA'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Calorías
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="450"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Proteína (g)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="30"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Hidratos (g)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="40"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Grasas (g)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="15"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
            min={0}
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Guardar comida'}
        </button>
      </div>
    </form>
  );
}
