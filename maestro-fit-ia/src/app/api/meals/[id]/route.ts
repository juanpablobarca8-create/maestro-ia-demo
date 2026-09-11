import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer, DEFAULT_USER_ID } from '@/lib/supabase-server';
import { updateMealSchema } from '@/lib/validation';

const idSchema = z.string().uuid();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = updateMealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from('meals')
    .update(parsed.data)
    .eq('id', parsedId.data)
    .eq('user_id', DEFAULT_USER_ID)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ meal: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from('meals')
    .delete()
    .eq('id', parsedId.data)
    .eq('user_id', DEFAULT_USER_ID);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
