'use client';

import { useState, FormEvent } from 'react';
import { Sparkles, X, Check, HelpCircle } from 'lucide-react';
import type { MealType } from '@/lib/database.types';
import { MEAL_TYPE_LABELS } from '@/lib/goals';

const inputClass =
  'w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white px-3.5 py-2.5 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors';

const labelClass = 'block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5';

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
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-stone-900 rounded-2xl shadow-card border border-stone-200/70 dark:border-stone-800 p-6 mb-5 space-y-4"
    >
      <h3 className="text-sm font-semibold text-stone-900 dark:text-white">Añadir comida</h3>

      {hint && (
        <div className="flex gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300">
          <HelpCircle size={16} className="shrink-0 mt-0.5" strokeWidth={2.25} />
          <span>{hint}</span>
        </div>
      )}

      <div>
        <label className={labelClass}>Tipo de comida</label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          className={inputClass}
        >
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {MEAL_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Qué has comido</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="2 huevos, tostada integral y Danone +Proteína"
          className={inputClass}
          maxLength={500}
        />
        <button
          type="button"
          onClick={handleEstimate}
          disabled={estimating || submitting}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={14} strokeWidth={2.25} />
          {estimating ? 'Estimando...' : 'Estimar calorías con IA'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Calorías</label>
          <input
            type="number"
            inputMode="numeric"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="450"
            className={inputClass}
            min={0}
          />
        </div>
        <div>
          <label className={labelClass}>Proteína (g)</label>
          <input
            type="number"
            inputMode="numeric"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="30"
            className={inputClass}
            min={0}
          />
        </div>
        <div>
          <label className={labelClass}>Hidratos (g)</label>
          <input
            type="number"
            inputMode="numeric"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="40"
            className={inputClass}
            min={0}
          />
        </div>
        <div>
          <label className={labelClass}>Grasas (g)</label>
          <input
            type="number"
            inputMode="numeric"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="15"
            className={inputClass}
            min={0}
          />
        </div>
      </div>

      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 inline-flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors"
        >
          <X size={16} strokeWidth={2.25} />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl disabled:opacity-50 transition-colors"
        >
          <Check size={16} strokeWidth={2.25} />
          {submitting ? 'Guardando...' : 'Guardar comida'}
        </button>
      </div>
    </form>
  );
}
