'use client';

import { useState } from 'react';
import { Target, X, Check } from 'lucide-react';

interface Goals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface GoalsSettingsProps {
  goals: Goals;
  onSave: (goals: Goals) => Promise<void>;
  onCancel: () => void;
}

const inputClass =
  'w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors';

const labelClass = 'block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5';

export function GoalsSettings({ goals, onSave, onCancel }: GoalsSettingsProps) {
  const [calories, setCalories] = useState(String(goals.calories));
  const [protein, setProtein] = useState(String(goals.protein_g));
  const [carbs, setCarbs] = useState(String(goals.carbs_g));
  const [fat, setFat] = useState(String(goals.fat_g));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    const values = {
      calories: Number(calories),
      protein_g: Number(protein),
      carbs_g: Number(carbs),
      fat_g: Number(fat),
    };
    if (Object.values(values).some((v) => !Number.isFinite(v) || v <= 0)) {
      setError('Introduce valores válidos en los 4 campos');
      return;
    }

    setSaving(true);
    try {
      await onSave(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-card border border-stone-200/70 dark:border-stone-800 p-6 mb-5 space-y-4">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-stone-900 dark:text-white">
        <Target size={16} strokeWidth={2.25} />
        Tus objetivos diarios
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Calorías</label>
          <input
            type="number"
            inputMode="numeric"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
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
            className={inputClass}
            min={0}
          />
        </div>
      </div>

      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-sm font-semibold py-2.5 px-4 rounded-xl disabled:opacity-50 transition-colors"
        >
          <X size={16} strokeWidth={2.25} />
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl disabled:opacity-50 transition-colors"
        >
          <Check size={16} strokeWidth={2.25} />
          {saving ? 'Guardando...' : 'Guardar objetivos'}
        </button>
      </div>
    </div>
  );
}
