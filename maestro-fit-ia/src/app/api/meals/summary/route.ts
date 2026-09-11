import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, DEFAULT_USER_ID } from '@/lib/supabase-server';
import { dateQuerySchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get('from');
  const to = request.nextUrl.searchParams.get('to');
  const parsedFrom = dateQuerySchema.safeParse(from);
  const parsedTo = dateQuerySchema.safeParse(to);

  if (!parsedFrom.success || !parsedTo.success) {
    return NextResponse.json(
      { error: 'Query params "from" y "to" requeridos en formato YYYY-MM-DD' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from('meals')
    .select('logged_date, calories, protein_g, carbs_g, fat_g')
    .eq('user_id', DEFAULT_USER_ID)
    .gte('logged_date', parsedFrom.data)
    .lte('logged_date', parsedTo.data);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byDate = new Map<string, { calories: number; protein_g: number; carbs_g: number; fat_g: number }>();
  for (const row of data) {
    const entry = byDate.get(row.logged_date) ?? { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    entry.calories += row.calories;
    entry.protein_g += Number(row.protein_g);
    entry.carbs_g += Number(row.carbs_g);
    entry.fat_g += Number(row.fat_g);
    byDate.set(row.logged_date, entry);
  }

  const days = Array.from(byDate.entries())
    .map(([logged_date, totals]) => ({ logged_date, ...totals }))
    .sort((a, b) => (a.logged_date < b.logged_date ? -1 : 1));

  const loggedDaysCount = days.length;
  const sum = days.reduce(
    (acc, d) => ({
      calories: acc.calories + d.calories,
      protein_g: acc.protein_g + d.protein_g,
      carbs_g: acc.carbs_g + d.carbs_g,
      fat_g: acc.fat_g + d.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const averages =
    loggedDaysCount > 0
      ? {
          calories: Math.round(sum.calories / loggedDaysCount),
          protein_g: Math.round(sum.protein_g / loggedDaysCount),
          carbs_g: Math.round(sum.carbs_g / loggedDaysCount),
          fat_g: Math.round(sum.fat_g / loggedDaysCount),
        }
      : { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

  return NextResponse.json({ days, averages, loggedDaysCount });
}
