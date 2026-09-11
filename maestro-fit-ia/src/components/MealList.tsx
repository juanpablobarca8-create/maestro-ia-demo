'use client';

import { Coffee, UtensilsCrossed, Cookie, Moon, Apple, Trash2, Camera } from 'lucide-react';
import type { Meal, MealType } from '@/lib/database.types';
import { MEAL_TYPE_LABELS } from '@/lib/goals';

interface MealListProps {
  meals: Meal[];
  onDelete: (id: string) => void;
  onEdit: (meal: Meal) => void;
}

const MEAL_TYPE_ICONS: Record<MealType, React.ElementType> = {
  desayuno: Coffee,
  comida: UtensilsCrossed,
  merienda: Cookie,
  cena: Moon,
  snack: Apple,
};

export function MealList({ meals, onDelete, onEdit }: MealListProps) {
  if (meals.length === 0) {
    return (
      <p className="text-stone-400 dark:text-stone-500 text-sm text-center py-6">
        Todavía no has registrado comidas hoy.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {meals.map((meal) => {
        const Icon = MEAL_TYPE_ICONS[meal.meal_type] ?? UtensilsCrossed;
        return (
          <div
            key={meal.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 dark:border-stone-800 hover:border-stone-200 dark:hover:border-stone-700 transition-colors"
          >
            <button
              type="button"
              onClick={() => onEdit(meal)}
              className="flex items-center gap-3 min-w-0 flex-1 text-left"
              aria-label="Editar comida"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 shrink-0">
                <Icon size={16} strokeWidth={2.25} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
                  {MEAL_TYPE_LABELS[meal.meal_type] ?? meal.meal_type}
                  {meal.source === 'photo' && <Camera size={11} strokeWidth={2.5} />}
                </div>
                <div className="text-sm text-stone-700 dark:text-stone-300 truncate">{meal.description}</div>
              </div>
            </button>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-semibold text-stone-900 dark:text-white">{meal.calories} kcal</span>
              <button
                onClick={() => onDelete(meal.id)}
                aria-label="Borrar comida"
                className="text-stone-300 dark:text-stone-600 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 size={15} strokeWidth={2.25} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
