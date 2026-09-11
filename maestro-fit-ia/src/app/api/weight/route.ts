import { NextRequest, NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/auth';
import { createWeightLogSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = Math.min(Math.max(Number(limitParam) || 30, 1), 365);

  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_date', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ weight_logs: data });
}

export async function POST(request: NextRequest) {
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

  const parsed = createWeightLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('weight_logs')
    .upsert(
      { ...parsed.data, user_id: user.id },
      { onConflict: 'user_id,logged_date' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ weight_log: data }, { status: 201 });
}
