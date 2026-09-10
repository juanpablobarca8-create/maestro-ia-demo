import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, DEFAULT_USER_ID } from '@/lib/supabase-server';
import { createMealSchema, dateQuerySchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get('date');
  const parsedDate = dateQuerySchema.safeParse(dateParam);

  if (!parsedDate.success) {
    return NextResponse.json(
      { error: 'Query param "date" requerido en formato YYYY-MM-DD' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from('meals')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .eq('logged_date', parsedDate.data)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ meals: data });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = createMealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from('meals')
    .insert({ ...parsed.data, user_id: DEFAULT_USER_ID })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ meal: data }, { status: 201 });
}
