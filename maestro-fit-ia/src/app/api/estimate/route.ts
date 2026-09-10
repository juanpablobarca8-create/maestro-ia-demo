import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { estimateSchema, estimateResultSchema } from '@/lib/validation';

const SYSTEM_PROMPT = `Eres un nutricionista experto. Dado un texto describiendo una comida, estima las calorías totales y los macronutrientes (proteína, hidratos, grasas) en gramos.

Si no se especifican cantidades, asume raciones estándar/promedio para un adulto.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes ni después, con este formato exacto:
{"calories": <entero>, "protein_g": <número con 1 decimal>, "carbs_g": <número con 1 decimal>, "fat_g": <número con 1 decimal>}`;

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY no está configurada en el servidor' },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = estimateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let message;
  try {
    message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: parsed.data.description }],
    });
  } catch (err) {
    console.error('Anthropic API error in /api/estimate:', err);
    return NextResponse.json({ error: 'No se pudo contactar con la IA' }, { status: 502 });
  }

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'Respuesta de IA vacía' }, { status: 502 });
  }

  let rawEstimate: unknown;
  try {
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    rawEstimate = JSON.parse(jsonMatch ? jsonMatch[0] : textBlock.text);
  } catch {
    return NextResponse.json({ error: 'No se pudo interpretar la respuesta de la IA' }, { status: 502 });
  }

  const resultParsed = estimateResultSchema.safeParse(rawEstimate);
  if (!resultParsed.success) {
    return NextResponse.json({ error: 'La estimación de la IA no tiene el formato esperado' }, { status: 502 });
  }

  return NextResponse.json({ estimate: resultParsed.data });
}
