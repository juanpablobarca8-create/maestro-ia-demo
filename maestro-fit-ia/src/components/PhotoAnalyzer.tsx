'use client';

import { useRef, useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
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
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-card border border-stone-200/70 dark:border-stone-800 p-6 mb-5 space-y-4">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-stone-900 dark:text-white">
        <Camera size={16} strokeWidth={2.25} />
        Analizar foto
      </h3>

      {preview && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Foto del plato" className="w-full rounded-xl max-h-64 object-cover" />
          {analyzing && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-900/50 rounded-xl">
              <Loader2 size={28} className="text-white animate-spin" />
            </div>
          )}
        </div>
      )}

      {analyzing && !preview && (
        <p className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm">
          <Loader2 size={14} className="animate-spin" />
          Analizando la foto...
        </p>
      )}

      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="photo-input"
      />

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          disabled={analyzing}
          className="flex-1 inline-flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-sm font-semibold py-2.5 px-4 rounded-xl disabled:opacity-50 transition-colors"
        >
          <X size={16} strokeWidth={2.25} />
          Cancelar
        </button>
        <label
          htmlFor="photo-input"
          className={`flex-1 inline-flex items-center justify-center gap-1.5 text-center bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-colors ${
            analyzing ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <Camera size={16} strokeWidth={2.25} />
          {analyzing ? 'Analizando...' : preview ? 'Otra foto' : 'Hacer foto'}
        </label>
      </div>
    </div>
  );
}
