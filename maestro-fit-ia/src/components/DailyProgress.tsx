'use client';

import { DAILY_GOALS } from '@/lib/goals';

interface Totals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

function ProgressBar({ value, goal, colorClass }: { value: number; goal: number; colorClass: string }) {
  const pct = Math.min(Math.round((value / goal) * 100), 100);
  return (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
      <div className={`${colorClass} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function DailyProgress({ totals }: { totals: Totals }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-slate-900 dark:text-white">🔥 Calorías</span>
          <span className="text-2xl font-bold text-orange-600">
            {totals.calories} / {DAILY_GOALS.calories}
          </span>
        </div>
        <ProgressBar value={totals.calories} goal={DAILY_GOALS.calories} colorClass="bg-orange-600" />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-slate-900 dark:text-white">💪 Proteína</span>
          <span className="text-2xl font-bold text-blue-600">
            {totals.protein_g}g / {DAILY_GOALS.protein_g}g
          </span>
        </div>
        <ProgressBar value={totals.protein_g} goal={DAILY_GOALS.protein_g} colorClass="bg-blue-600" />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-slate-900 dark:text-white font-medium">
          🍞 Hidratos: <strong>{totals.carbs_g}g</strong> / {DAILY_GOALS.carbs_g}g
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-slate-900 dark:text-white font-medium">
          🥑 Grasas: <strong>{totals.fat_g}g</strong> / {DAILY_GOALS.fat_g}g
        </span>
      </div>
    </div>
  );
}
