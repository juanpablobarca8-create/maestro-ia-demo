export type MealType = 'desayuno' | 'comida' | 'merienda' | 'cena' | 'snack';
export type MealSource = 'manual' | 'photo' | 'barcode';

export type Meal = {
  id: string;
  user_id: string;
  logged_date: string;
  meal_type: MealType;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  source: MealSource;
  photo_url: string | null;
  created_at: string;
};

export type WeightLog = {
  id: string;
  user_id: string;
  logged_date: string;
  weight_kg: number;
  created_at: string;
};

export type Profile = {
  id: string;
  daily_calories_goal: number;
  daily_protein_goal: number;
  daily_carbs_goal: number;
  daily_fat_goal: number;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      meals: {
        Row: Meal;
        Insert: Omit<Meal, 'id' | 'created_at' | 'photo_url'> & {
          id?: string;
          created_at?: string;
          photo_url?: string | null;
        };
        Update: Partial<Meal>;
        Relationships: [];
      };
      weight_logs: {
        Row: WeightLog;
        Insert: Omit<WeightLog, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<WeightLog>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      meal_type: MealType;
    };
    CompositeTypes: Record<string, never>;
  };
};
