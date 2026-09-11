'use client';

import { useEffect, useState, useCallback } from 'react';
import { Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { WeightLog } from '@/lib/database.types';
import { todayLocalISODate, formatDateLong } from '@/lib/dates';

export function WeightTracker() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const today = todayLocalISODate();

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/weight?limit=10');
      if (!res.ok) throw new Error('No se pudo cargar el histórico de peso');
      const data = await res.json();
      setLogs(data.weight_logs ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const todayLog = logs.find((l) => l.logged_date === today);

  const handleSave = async () => {
    setSaveError(null);
    const weightNum = Number(weightInput);
    if (weightInput.trim() === '' || !Number.isFinite(weightNum) || weightNum <= 0) {
      setSaveError('Introduce un peso válido');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logged_date: today, weight_kg: weightNum }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'No se pudo guardar el peso');
      }
      setLogs((prev) => [data.weight_log, ...prev.filter((l) => l.logged_date !== today)]);
      setWeightInput('');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo guardar el peso');
    } finally {
      setSaving(false);
    }
  };

  const sortedLogs = [...logs].sort((a, b) => (a.logged_date < b.logged_date ? 1 : -1));
  const previousLog = sortedLogs.find((l) => l.logged_date !== today);
  const latestWeight = todayLog?.weight_kg ?? sortedLogs[0]?.weight_kg;
  const delta =
    latestWeight != null && previousLog ? Number(latestWeight) - Number(previousLog.weight_kg) : null;

  const DeltaIcon = delta == null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const deltaColor =
    delta == null || delta === 0
      ? 'text-stone-400 dark:text-stone-500'
      : delta > 0
        ? 'text-red-500'
        : 'text-emerald-500';

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-card border border-stone-200/70 dark:border-stone-800 p-6 mb-5">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 mb-4">
        <Scale size={14} strokeWidth={2.25} />
        Peso
      </h3>

      <div className="flex gap-2.5 mb-4">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          placeholder={todayLog ? String(todayLog.weight_kg) : 'kg de hoy'}
          className="flex-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white px-3.5 py-2.5 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors"
          min={0}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando...' : todayLog ? 'Actualizar' : 'Guardar'}
        </button>
      </div>

      {saveError && <p className="text-red-600 dark:text-red-400 text-sm mb-4">{saveError}</p>}

      {loading && <p className="text-stone-400 dark:text-stone-500 text-sm">Cargando...</p>}
      {loadError && <p className="text-red-600 dark:text-red-400 text-sm">{loadError}</p>}

      {!loading && !loadError && (
        <>
          {latestWeight != null && (
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-stone-900 dark:text-white">{latestWeight} kg</span>
              {delta != null && (
                <span className={`inline-flex items-center gap-1 text-sm font-medium ${deltaColor}`}>
                  <DeltaIcon size={14} strokeWidth={2.5} />
                  {Math.abs(delta).toFixed(1)} kg
                </span>
              )}
            </div>
          )}

          {sortedLogs.length > 1 && (
            <div className="space-y-1.5 pt-1">
              {sortedLogs.slice(0, 7).map((log) => (
                <div key={log.id} className="flex justify-between text-sm text-stone-500 dark:text-stone-400">
                  <span>{formatDateLong(log.logged_date)}</span>
                  <span className="font-medium text-stone-900 dark:text-white">{log.weight_kg} kg</span>
                </div>
              ))}
            </div>
          )}

          {sortedLogs.length === 0 && (
            <p className="text-stone-400 dark:text-stone-500 text-sm">
              Todavía no has registrado ningún peso.
            </p>
          )}
        </>
      )}
    </div>
  );
}
