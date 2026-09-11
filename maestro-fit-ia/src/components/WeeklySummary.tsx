'use client';

import { useEffect, useState, useCallback } from 'react';
import { CalendarRange } from 'lucide-react';
import { todayLocalISODate, daysAgoLocalISODate, formatWeekdayShort } from '@/lib/dates';

interface DayTotals {
  logged_date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface WeeklySummaryProps {
  caloriesGoal: number;
}

const CHART_HEIGHT = 96;

export function WeeklySummary({ caloriesGoal }: WeeklySummaryProps) {
  const [days, setDays] = useState<DayTotals[]>([]);
  const [averageCalories, setAverageCalories] = useState(0);
  const [loggedDaysCount, setLoggedDaysCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const to = todayLocalISODate();
      const from = daysAgoLocalISODate(6);
      const res = await fetch(`/api/meals/summary?from=${from}&to=${to}`);
      if (!res.ok) throw new Error('No se pudo cargar el resumen semanal');
      const data = await res.json();
      setDays(data.days ?? []);
      setAverageCalories(data.averages?.calories ?? 0);
      setLoggedDaysCount(data.loggedDaysCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-card border border-stone-200/70 dark:border-stone-800 p-6 mb-5">
        <p className="text-stone-400 dark:text-stone-500 text-sm">Cargando resumen semanal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-card border border-stone-200/70 dark:border-stone-800 p-6 mb-5">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  // Build all 7 dates in range (including days with no logged meals) so the chart has a fixed grid.
  const range = Array.from({ length: 7 }, (_, i) => daysAgoLocalISODate(6 - i));
  const byDate = new Map(days.map((d) => [d.logged_date, d]));
  const maxValue = Math.max(caloriesGoal, ...days.map((d) => d.calories), 1) * 1.1;
  const goalLineTop = CHART_HEIGHT - (caloriesGoal / maxValue) * CHART_HEIGHT;

  const delta = loggedDaysCount > 0 ? averageCalories - caloriesGoal : null;
  const deltaIsGood = delta != null && delta <= 0;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-card border border-stone-200/70 dark:border-stone-800 p-6 mb-5">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 mb-5">
        <CalendarRange size={14} strokeWidth={2.25} />
        Resumen semanal
      </h3>

      <div className="flex items-baseline justify-between mb-5">
        <div>
          <p className="text-xs text-stone-500 dark:text-stone-400">Media diaria (7 días)</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white">
            {loggedDaysCount > 0 ? averageCalories : '—'}
            <span className="text-sm font-normal text-stone-400 dark:text-stone-500"> kcal</span>
          </p>
        </div>
        {delta != null && (
          <span
            className={`text-sm font-medium ${deltaIsGood ? 'text-emerald-500' : 'text-red-500'}`}
          >
            {delta > 0 ? '+' : ''}
            {delta} vs objetivo
          </span>
        )}
      </div>

      <div className="relative" style={{ height: CHART_HEIGHT }}>
        <div
          className="absolute left-0 right-0 border-t border-dashed border-stone-300 dark:border-stone-600"
          style={{ top: goalLineTop }}
        />
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {range.map((date) => {
            const totals = byDate.get(date);
            const calories = totals?.calories ?? 0;
            const heightPx = Math.max((calories / maxValue) * CHART_HEIGHT, calories > 0 ? 3 : 0);
            const isToday = date === todayLocalISODate();
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelected(selected === date ? null : date)}
                className="relative flex-1 h-full flex items-end"
                title={`${calories} kcal`}
              >
                {selected === date && (
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
                    {calories}
                  </span>
                )}
                <span
                  className={`w-full rounded-t ${
                    isToday ? 'bg-brand-600' : 'bg-brand-300 dark:bg-brand-800'
                  }`}
                  style={{ height: heightPx }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between mt-2">
        {range.map((date) => (
          <span
            key={date}
            className="flex-1 text-center text-[11px] font-medium text-stone-400 dark:text-stone-500"
          >
            {formatWeekdayShort(date)}
          </span>
        ))}
      </div>
    </div>
  );
}
