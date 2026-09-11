import { NextRequest, NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validation';
import { DEFAULT_GOALS } from '@/lib/goals';

export async function GET() {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    profile: data ?? {
      id: user.id,
      daily_calories_goal: DEFAULT_GOALS.calories,
      daily_protein_goal: DEFAULT_GOALS.protein_g,
      daily_carbs_goal: DEFAULT_GOALS.carbs_g,
      daily_fat_goal: DEFAULT_GOALS.fat_g,
    },
  });
}

export async function PUT(request: NextRequest) {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...parsed.data }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
