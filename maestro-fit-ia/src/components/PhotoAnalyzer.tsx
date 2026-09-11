'use client';

import { useRef, useState } from 'react';
import { resizeImageToDataUrl } from '@/lib/image';

export interface PhotoEstimate {
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  question: string | null;
}

interface PhotoAnalyzerProps {
  onAnalyzed: (estimate: PhotoEstimate) => void;
  onCancel: () => void;
}

export function PhotoAnalyzer({ onAnalyzed, onCancel }: PhotoAnalyzerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setAnalyzing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setPreview(dataUrl);

      const res = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'No se pudo analizar la foto');
      }
      onAnalyzed(data.estimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo analizar la foto');
    } finally {
      setAnalyzing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6 space-y-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">📸 Analizar foto</h3>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Foto del plato" className="w-full rounded-lg max-h-64 object-cover" />
      )}

      {analyzing && (
        <p className="text-slate-500 dark:text-slate-400 text-sm">Analizando la foto...</p>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="photo-input"
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={analyzing}
          className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          Cancelar
        </button>
        <label
          htmlFor="photo-input"
          className={`flex-1 text-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer ${
            analyzing ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          {analyzing ? 'Analizando...' : preview ? 'Otra foto' : 'Hacer foto'}
        </label>
      </div>
    </div>
  );
}
