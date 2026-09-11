'use client';

import { Flame, Dumbbell, Wheat, Droplet } from 'lucide-react';
import { DAILY_GOALS } from '@/lib/goals';
import { CircularProgress } from '@/components/CircularProgress';

interface Totals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

function MacroBar({
  icon: Icon,
  label,
  value,
  goal,
  colorClass,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  goal: number;
  colorClass: string;
}) {
  const pct = Math.min(Math.round((value / goal) * 100), 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-sm font-medium text-stone-600 dark:text-stone-400">
          <Icon size={15} strokeWidth={2.25} />
          {label}
        </span>
        <span className="text-sm font-semibold text-stone-900 dark:text-white">
          {value}
          <span className="text-stone-400 dark:text-stone-500 font-normal"> / {goal}g</span>
        </span>
      </div>
      <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5">
        <div className={`${colorClass} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function DailyProgress({ totals }: { totals: Totals }) {
  const remaining = Math.max(DAILY_GOALS.calories - totals.calories, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <CircularProgress value={totals.calories} goal={DAILY_GOALS.calories} size={116} strokeWidth={10}>
          <div className="flex flex-col items-center">
            <Flame size={18} className="text-brand-600 mb-0.5" strokeWidth={2.25} />
            <span className="text-xl font-bold text-stone-900 dark:text-white leading-none">
              {totals.calories}
            </span>
            <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">de {DAILY_GOALS.calories}</span>
          </div>
        </CircularProgress>

        <div>
          <p className="text-sm text-stone-500 dark:text-stone-400">Calorías restantes</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white">{remaining}</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            {Math.round((totals.calories / DAILY_GOALS.calories) * 100)}% del objetivo diario
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <MacroBar
          icon={Dumbbell}
          label="Proteína"
          value={totals.protein_g}
          goal={DAILY_GOALS.protein_g}
          colorClass="bg-blue-500"
        />
        <MacroBar
          icon={Wheat}
          label="Hidratos"
          value={totals.carbs_g}
          goal={DAILY_GOALS.carbs_g}
          colorClass="bg-amber-500"
        />
        <MacroBar
          icon={Droplet}
          label="Grasas"
          value={totals.fat_g}
          goal={DAILY_GOALS.fat_g}
          colorClass="bg-emerald-500"
        />
      </div>
    </div>
  );
}
