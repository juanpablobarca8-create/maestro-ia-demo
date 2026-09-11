import { NextRequest, NextResponse } from 'next/server';
import { suggestDinnerSchema, dinnerSuggestionResultSchema } from '@/lib/validation';

const SYSTEM_PROMPT = `Eres un nutricionista práctico ayudando a alguien a decidir qué cenar en España.

Te dan las calorías y macronutrientes que le quedan disponibles hoy (pueden ser negativos si ya se ha pasado).

Sugiere UNA cena concreta y sencilla de cocinar que encaje razonablemente bien en ese margen, priorizando alcanzar la proteína. Si los números son negativos o muy bajos, sugiere algo ligero y bajo en calorías, o dilo directamente sin dar receta grande.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, con este formato:
{"suggestion": "<una frase o dos, tono cercano y directo, en español>"}`;

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

  const parsed = suggestDinnerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const userMessage = `Me quedan hoy: ${parsed.data.remaining_calories} kcal, ${parsed.data.remaining_protein_g}g proteína, ${parsed.data.remaining_carbs_g}g hidratos, ${parsed.data.remaining_fat_g}g grasas.`;

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
        max_tokens: 200,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
    });
  } catch (err) {
    console.error('OpenAI API network error in /api/suggest-dinner:', err);
    return NextResponse.json({ error: 'No se pudo contactar con la IA' }, { status: 502 });
  }

  if (!openaiRes.ok) {
    const errBody = await openaiRes.text();
    console.error('OpenAI API error in /api/suggest-dinner:', openaiRes.status, errBody);
    return NextResponse.json({ error: 'No se pudo contactar con la IA' }, { status: 502 });
  }

  const completion = await openaiRes.json();
  const content: string | undefined = completion?.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: 'Respuesta de IA vacía' }, { status: 502 });
  }

  let rawResult: unknown;
  try {
    rawResult = JSON.parse(content);
  } catch {
    return NextResponse.json({ error: 'No se pudo interpretar la respuesta de la IA' }, { status: 502 });
  }

  const resultParsed = dinnerSuggestionResultSchema.safeParse(rawResult);
  if (!resultParsed.success) {
    return NextResponse.json({ error: 'La respuesta de la IA no tiene el formato esperado' }, { status: 502 });
  }

  return NextResponse.json(resultParsed.data);
}
