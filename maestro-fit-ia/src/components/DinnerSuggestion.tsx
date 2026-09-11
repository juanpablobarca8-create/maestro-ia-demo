'use client';

import { useState } from 'react';
import { Moon, Sparkles, Loader2 } from 'lucide-react';

interface Remaining {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export function DinnerSuggestion({ remaining }: { remaining: Remaining }) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/suggest-dinner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remaining_calories: Math.round(remaining.calories),
          remaining_protein_g: Math.round(remaining.protein_g),
          remaining_carbs_g: Math.round(remaining.carbs_g),
          remaining_fat_g: Math.round(remaining.fat_g),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'No se pudo obtener una sugerencia');
      }
      setSuggestion(data.suggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo obtener una sugerencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-card border border-stone-200/70 dark:border-stone-800 p-6 mb-5">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 mb-4">
        <Moon size={14} strokeWidth={2.25} />
        ¿Qué ceno?
      </h3>

      {!suggestion && !loading && (
        <>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
            Te quedan {Math.round(remaining.calories)} kcal y {Math.round(remaining.protein_g)}g de
            proteína hoy. Te sugiero algo que encaje.
          </p>
          <button
            onClick={handleSuggest}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors"
          >
            <Sparkles size={16} strokeWidth={2.25} />
            Sugerir cena
          </button>
        </>
      )}

      {loading && (
        <p className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm py-2">
          <Loader2 size={14} className="animate-spin" />
          Pensando en una cena...
        </p>
      )}

      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

      {suggestion && !loading && (
        <>
          <p className="text-sm text-stone-700 dark:text-stone-300 mb-4">{suggestion}</p>
          <button
            onClick={handleSuggest}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <Sparkles size={14} strokeWidth={2.25} />
            Otra idea
          </button>
        </>
      )}
    </div>
  );
}
