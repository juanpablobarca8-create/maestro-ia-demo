import { NextRequest, NextResponse } from 'next/server';
import { analyzePhotoSchema, photoEstimateResultSchema } from '@/lib/validation';

const SYSTEM_PROMPT = `Eres un nutricionista experto analizando una foto de un plato de comida.

1. Identifica los alimentos visibles y estima sus cantidades a partir de la imagen (usa referencias visuales como el tamaño del plato o los cubiertos).
2. Si no se puede saber algo importante que cambiaría mucho el resultado (por ejemplo: si algo está frito u horneado, o la cantidad de aceite/salsa), formula UNA sola pregunta corta para aclararlo. Si no hay ninguna ambigüedad relevante, deja "question" en null.
3. Estima las calorías totales y los macronutrientes (proteína, hidratos, grasas) en gramos, asumiendo el escenario más probable si hay algo ambiguo.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes ni después, con este formato exacto (todos los valores numéricos como enteros):
{"description": "<lista breve de los alimentos identificados>", "calories": <entero>, "protein_g": <entero>, "carbs_g": <entero>, "fat_g": <entero>, "question": <string o null>}`;

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY no está configurada en el servidor' },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = analyzePhotoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let openaiRes: Response;
  try {
    openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        max_tokens: 400,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analiza esta foto de comida.' },
              { type: 'image_url', image_url: { url: parsed.data.image } },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    console.error('OpenAI API network error in /api/analyze-photo:', err);
    return NextResponse.json({ error: 'No se pudo contactar con la IA' }, { status: 502 });
  }

  if (!openaiRes.ok) {
    const errBody = await openaiRes.text();
    console.error('OpenAI API error in /api/analyze-photo:', openaiRes.status, errBody);
    return NextResponse.json({ error: 'No se pudo contactar con la IA' }, { status: 502 });
  }

  const completion = await openaiRes.json();
  const content: string | undefined = completion?.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: 'Respuesta de IA vacía' }, { status: 502 });
  }

  let rawEstimate: unknown;
  try {
    rawEstimate = JSON.parse(content);
  } catch {
    return NextResponse.json({ error: 'No se pudo interpretar la respuesta de la IA' }, { status: 502 });
  }

  const resultParsed = photoEstimateResultSchema.safeParse(rawEstimate);
  if (!resultParsed.success) {
    return NextResponse.json({ error: 'La estimación de la IA no tiene el formato esperado' }, { status: 502 });
  }

  return NextResponse.json({ estimate: resultParsed.data });
}
