import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, DEFAULT_USER_ID } from '@/lib/supabase-server';
import { createWeightLogSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = Math.min(Math.max(Number(limitParam) || 30, 1), 365);

  const { data, error } = await supabaseServer
    .from('weight_logs')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .order('logged_date', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ weight_logs: data });
}

export async function POST(request: NextRequest) {
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

  const { data, error } = await supabaseServer
    .from('weight_logs')
    .upsert(
      { ...parsed.data, user_id: DEFAULT_USER_ID },
      { onConflict: 'user_id,logged_date' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ weight_log: data }, { status: 201 });
}
