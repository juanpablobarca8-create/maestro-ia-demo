'use client';

import type { Meal } from '@/lib/database.types';
import { MEAL_TYPE_LABELS } from '@/lib/goals';

interface MealListProps {
  meals: Meal[];
  onDelete: (id: string) => void;
}

export function MealList({ meals, onDelete }: MealListProps) {
  if (meals.length === 0) {
    return (
      <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">
        Todavía no has registrado comidas hoy.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {meals.map((meal) => (
        <div
          key={meal.id}
          className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg gap-3"
        >
          <div className="min-w-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {MEAL_TYPE_LABELS[meal.meal_type] ?? meal.meal_type}
            </div>
            <div className="text-slate-700 dark:text-slate-300 truncate">{meal.description}</div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-semibold text-slate-900 dark:text-white">{meal.calories} kcal</span>
            <button
              onClick={() => onDelete(meal.id)}
              aria-label="Borrar comida"
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
