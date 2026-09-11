import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, DEFAULT_USER_ID } from '@/lib/supabase-server';
import { updateProfileSchema } from '@/lib/validation';
import { DEFAULT_GOALS } from '@/lib/goals';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('*')
    .eq('id', DEFAULT_USER_ID)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    profile: data ?? {
      id: DEFAULT_USER_ID,
      daily_calories_goal: DEFAULT_GOALS.calories,
      daily_protein_goal: DEFAULT_GOALS.protein_g,
      daily_carbs_goal: DEFAULT_GOALS.carbs_g,
      daily_fat_goal: DEFAULT_GOALS.fat_g,
    },
  });
}

export async function PUT(request: NextRequest) {
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

  const { data, error } = await supabaseServer
    .from('profiles')
    .upsert({ id: DEFAULT_USER_ID, ...parsed.data }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
