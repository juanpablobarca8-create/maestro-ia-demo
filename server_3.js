// ============================================================
//  Maestro IA Studio — Servidor proxy (OpenAI)
//  Requisitos: Node.js 18+
//  Instalación: npm install express cors
//  Uso: OPENAI_API_KEY=sk-... node server.js
// ============================================================

const express = require('express');
const cors    = require('cors');
const https   = require('https');

const app  = express();
const PORT = process.env.PORT || 3000;
const KEY  = process.env.OPENAI_API_KEY;

if (!KEY) {
  console.error('❌  Falta la variable de entorno OPENAI_API_KEY');
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ── Ruta proxy ──────────────────────────────────────────────
app.post('/api/chat', (req, res) => {
  const { system, messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages requerido' });
  }

  // Convertir formato Anthropic → OpenAI
  const openaiMessages = [
    { role: 'system', content: system || 'Eres un asistente útil.' },
    ...messages
  ];

  const body = JSON.stringify({
    model:      'gpt-4o-mini',   // rápido y barato — cámbialo a gpt-4o si quieres más calidad
    max_tokens: 300,
    messages:   openaiMessages
  });

  const options = {
    hostname: 'api.openai.com',
    path:     '/v1/chat/completions',
    method:   'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${KEY}`,
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const apiReq = https.request(options, apiRes => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        // Convertir respuesta OpenAI → formato que espera la demo
        const text = parsed.choices?.[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';
        res.json({ content: [{ type: 'text', text }] });
      } catch {
        res.status(500).json({ error: 'Respuesta inválida de OpenAI' });
      }
    });
  });

  apiReq.on('error', err => {
    console.error('Error API:', err.message);
    res.status(502).json({ error: 'Error de conexión con OpenAI' });
  });

  apiReq.write(body);
  apiReq.end();
});

app.listen(PORT, () => {
  console.log(`✅  Servidor activo en http://localhost:${PORT}`);
  console.log(`    Demo en: http://localhost:${PORT}/maestro-ia-demo.html`);
});
