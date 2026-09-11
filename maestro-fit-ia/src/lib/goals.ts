// Fallback used until the profile loads (or if the user has none saved yet).
export const DEFAULT_GOALS = {
  calories: 2250,
  protein_g: 160,
  carbs_g: 220,
  fat_g: 70,
};

export const MEAL_TYPE_LABELS: Record<string, string> = {
  desayuno: 'Desayuno',
  comida: 'Comida',
  merienda: 'Merienda',
  cena: 'Cena',
  snack: 'Snack',
};
