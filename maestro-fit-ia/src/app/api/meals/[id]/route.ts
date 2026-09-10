import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer, DEFAULT_USER_ID } from '@/lib/supabase-server';

const idSchema = z.string().uuid();

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
