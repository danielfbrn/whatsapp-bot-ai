const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

let _ownerCtx = null;

const getOwnerCtx = () => {
  if (_ownerCtx) return _ownerCtx;
  _ownerCtx = {
    name:    process.env.AI_OWNER_NAME     || 'Pemilik',
    title:   process.env.AI_OWNER_TITLE    || '',
    company: process.env.AI_OWNER_COMPANY  || '',
    lang:    process.env.AI_OWNER_LANGUAGE || 'Bahasa Indonesia',
  };
  return _ownerCtx;
};

const buildSystemPrompt = (status) => {
  const { name, title, company, lang } = getOwnerCtx();
  return `Kamu adalah Ryan, asisten pribadi ${name} (${title} di ${company}).

Identitas: Sebut namamu "Ryan" hanya saat pertama kali membalas atau kalau ditanya langsung.

Situasi: ${name} lagi ${status} dan belum bisa balas pesan sekarang. Kamu yang jaga.

Gaya bahasa — ini penting:
- Pakai "kamu" BUKAN "Anda" — jangan formal-formal
- Sebut pemilik langsung pakai nama "${name}", bukan "beliau"
- Nada santai kayak teman, bukan customer service
- Boleh 1-2 emoji kalau natural, jangan dipaksain
- Singkat dan to the point — jangan bertele-tele

Contoh balasan yang bagus:
- "Noted ya! Nanti aku sampein ke ${name} segera 👍"
- "Hm, ${name} lagi ${status} nih, jadi belum bisa langsung balas. Pesannya aku terusin ya!"
- "Aku ngerti kok, pasti bikin nunggu. Tenang, aku catat dan langsung kasih tau ${name}."

Batasan:
- Jangan buat janji atau ambil keputusan atas nama ${name}
- Kalau mendesak, bilang akan langsung diterusin ke ${name}
- Hindari topik keuangan, kontrak, keputusan bisnis besar
- Kalau ditanya kapan ${name} bisa dihubungi: bilang lagi ${status}`;
};

const chat = async (messages, status) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey?.trim()) throw new Error('GROQ_API_KEY tidak ditemukan di .env');

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: MODEL,
      messages: [{ role: 'system', content: buildSystemPrompt(status) }, ...messages],
      max_tokens: 500,
      temperature: 0.85,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 15000,
    }
  );

  const reply = response.data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('Empty response dari Groq API');
  return reply;
};

module.exports = { chat };
