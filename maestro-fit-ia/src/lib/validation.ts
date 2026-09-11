import { z } from 'zod';

export const mealTypeSchema = z.enum(['desayuno', 'comida', 'merienda', 'cena', 'snack']);

export const createMealSchema = z.object({
  logged_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  meal_type: mealTypeSchema,
  description: z.string().trim().min(1).max(500),
  calories: z.number().int().min(0).max(10000),
  protein_g: z.number().min(0).max(1000).default(0),
  carbs_g: z.number().min(0).max(1000).default(0),
  fat_g: z.number().min(0).max(1000).default(0),
  source: z.enum(['manual', 'photo', 'barcode']).default('manual'),
  photo_url: z.string().url().nullable().optional(),
});

export const createWeightLogSchema = z.object({
  logged_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  weight_kg: z.number().min(20).max(400),
});

export const dateQuerySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)');

export const estimateSchema = z.object({
  description: z.string().trim().min(1).max(500),
});

export const estimateResultSchema = z.object({
  calories: z.number().min(0).max(10000),
  protein_g: z.number().min(0).max(1000),
  carbs_g: z.number().min(0).max(1000),
  fat_g: z.number().min(0).max(1000),
});

export const analyzePhotoSchema = z.object({
  image: z.string().startsWith('data:image/', 'Debe ser una imagen en base64 (data URL)'),
});

export const photoEstimateResultSchema = z.object({
  description: z.string().min(1).max(300),
  calories: z.number().min(0).max(10000),
  protein_g: z.number().min(0).max(1000),
  carbs_g: z.number().min(0).max(1000),
  fat_g: z.number().min(0).max(1000),
  question: z.string().max(300).nullable(),
});
