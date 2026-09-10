'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto max-w-md px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            🔥 Maestro Fit IA
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Tu asistente de calorías inteligente</p>
        </div>

        {/* Daily Summary Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">
            Hoy — 10 septiembre
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-slate-900 dark:text-white">🔥 Calorías</span>
                <span className="text-2xl font-bold text-orange-600">1.420 / 2.250</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '63%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-slate-900 dark:text-white">💪 Proteína</span>
                <span className="text-2xl font-bold text-blue-600">103 / 160 g</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '64%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <span className="text-slate-900 dark:text-white font-medium">🍞 Hidratos: <strong>128 g</strong></span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <span className="text-slate-900 dark:text-white font-medium">🥑 Grasas: <strong>53 g</strong></span>
              </div>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all">
            📸 Analizar comida
          </button>
        </div>

        {/* Meals Today */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Comidas de hoy</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <span className="text-slate-700 dark:text-slate-300">Desayuno</span>
              <span className="font-semibold text-slate-900 dark:text-white">410 kcal</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <span className="text-slate-700 dark:text-slate-300">Comida</span>
              <span className="font-semibold text-slate-900 dark:text-white">760 kcal</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <span className="text-slate-700 dark:text-slate-300">Merienda</span>
              <span className="font-semibold text-slate-900 dark:text-white">250 kcal</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-600 rounded-lg opacity-50">
              <span className="text-slate-600 dark:text-slate-400">Cena</span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">pendiente</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 dark:text-slate-500 text-xs mt-8">
          <p>MVP v0.1 — entrada manual + contador diario</p>
        </div>
      </div>
    </main>
  );
}
