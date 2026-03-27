// ============================================================
// THE LORE ENGINE — services/ai.js
// ============================================================
// Mock Mode: generates fake Latin-ish lore when no API key is set.
// Live Mode: plug in your key and provider below.
//
// Supported providers: "anthropic", "openai", "gemini"
// ============================================================

const CONFIG = {
  provider: "anthropic",                    // "anthropic" | "openai" | "gemini"
  apiKey: "",                               // paste your key here
  model: {
    anthropic: "claude-sonnet-4-20250514",
    openai: "gpt-4o",
    gemini: "gemini-1.5-flash",
  },
};

// ── System prompt: the soul of the universe ──────────────────

export const SYSTEM_PROMPT = `You are the archivist of The Atlas of Nowhere — a vast, self-consistent fictional encyclopedia documenting a surreal alternate universe. Your tone is dry, academic, and encyclopedic — like a Wikipedia editor who takes absurd subjects completely seriously.

RULES:
1. Write in a neutral, scholarly voice. No humor, no winking at the reader. Treat every subject — no matter how bizarre — as established fact.
2. Invent surreal, mundane, or uncanny facts. Examples of subject matter: "The History of Sentient Bread," "The Bureau of Misplaced Tuesdays," "Gravitational Etiquette," "The Third Moon's Apology."
3. Structure every article as follows:
   - A lead paragraph (2-3 sentences summarizing the topic)
   - An INFOBOX block (see format below)
   - 3-5 sections with ## headers
   - Each section should be 2-4 paragraphs
4. ALWAYS include exactly 5-8 new [[Double Bracketed Links]] to other topics that don't exist yet. Spread them naturally throughout the text. These become the exploration paths.
5. You may reference topics from the EXISTING LORE provided in context. Use their names exactly as given. This maintains universe consistency.
6. Never break character. Never reference being an AI. You are an encyclopedia.
7. Dates should use the "Revised Spiral Calendar" (e.g., "14th of Rustmonth, Cycle 883").
8. Units of measurement should be invented but used consistently (e.g., "3.7 klenn," "approximately 40 dimwidths").

INFOBOX FORMAT (put this EXACTLY after the lead paragraph):
:::infobox
Title: [Topic Name]
Type: [Person/Place/Event/Concept/Organization/Object/Phenomenon]
Region: [invented region name]
Era: [invented era or date range]
Status: [Active/Defunct/Theoretical/Disputed/Unknown]
Notable: [one quirky fact]
:::

MARKDOWN FORMAT:
- Use ## for section headers
- Use standard markdown for bold, italic, lists
- Use [[Double Brackets]] for links to other encyclopedia entries
- Do NOT use # (h1) — the app renders the title separately`;


// ── Mock mode: fake Latin generator ──────────────────────────

const LATIN_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing",
  "elit", "sed", "eiusmod", "tempor", "incididunt", "labore", "dolore",
  "magna", "aliqua", "enim", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "commodo",
  "consequat", "duis", "aute", "irure", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "proident", "sunt", "culpa", "officia",
  "deserunt", "mollit", "anim", "est", "gravitas", "nebulae", "crystallum",
  "temporis", "fabrica", "resonantia", "meridium", "oscillum", "paradoxum",
];

const MOCK_TOPICS = [
  "The Bureau of Misplaced Tuesdays",
  "Gravitational Etiquette",
  "The Third Moon's Apology",
  "Sentient Bread Uprising of Cycle 441",
  "The Department of Uncomfortable Silences",
  "Recursive Cartography",
  "The Velvet Audit",
  "Philosophical Plumbing",
  "The Midnight Census",
  "Thermal Nostalgia",
  "The Committee for the Reorganization of Echoes",
  "Liquid Architecture",
  "The Treaty of Reluctant Magnets",
  "Temporal Fumigation",
  "The Annual Parade of Forgotten Numbers",
];

function randomWords(n) {
  return Array.from({ length: n }, () =>
    LATIN_WORDS[Math.floor(Math.random() * LATIN_WORDS.length)]
  ).join(" ");
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pickRandomTopics(exclude, count = 6) {
  const available = MOCK_TOPICS.filter((t) => t !== exclude);
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateMockArticle(title) {
  const links = pickRandomTopics(title);
  const linkInsert = (i) => `[[${links[i % links.length]}]]`;

  const regions = ["Upper Meridium", "The Folded Reaches", "Sub-Oscillum", "The Penumbral Shelf", "Graywater Basin"];
  const eras = ["Cycle 441–588", "Late Rustmonth Period", "Pre-Consolidation Era", "The Quiet Centuries", "Cycle 883–present"];
  const statuses = ["Active", "Defunct", "Theoretical", "Disputed", "Under Review", "Perpetually Pending"];
  const types = ["Concept", "Organization", "Phenomenon", "Event", "Place", "Object", "Person"];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  return `${capitalize(randomWords(15))}. ${capitalize(randomWords(20))} ${linkInsert(0)} ${randomWords(10)}.

:::infobox
Title: ${title}
Type: ${pick(types)}
Region: ${pick(regions)}
Era: ${pick(eras)}
Status: ${pick(statuses)}
Notable: ${capitalize(randomWords(6))}
:::

## ${capitalize(randomWords(3))}

${capitalize(randomWords(30))} ${linkInsert(1)} ${randomWords(20)}. ${capitalize(randomWords(25))}.

${capitalize(randomWords(35))} ${linkInsert(2)} ${randomWords(15)}. ${capitalize(randomWords(20))}.

## ${capitalize(randomWords(3))}

${capitalize(randomWords(28))} ${linkInsert(3)} ${randomWords(18)}.

${capitalize(randomWords(22))} ${randomWords(15)} ${linkInsert(4)} ${randomWords(12)}.

## ${capitalize(randomWords(3))}

${capitalize(randomWords(32))} ${linkInsert(5)} ${randomWords(20)}.

${capitalize(randomWords(18))} ${randomWords(25)}.

## See Also

- ${linkInsert(0)}
- ${linkInsert(2)}
- ${linkInsert(4)}
`;
}


// ── Live mode: API callers ───────────────────────────────────

async function callAnthropic(prompt, context) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CONFIG.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: CONFIG.model.anthropic,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Article not found in the archives.";
}

async function callOpenAI(prompt, context) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: CONFIG.model.openai,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 2048,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Article not found in the archives.";
}

async function callGemini(prompt, context) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.model.gemini}:generateContent?key=${CONFIG.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2048 },
      }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Article not found in the archives.";
}


// ── Public API ───────────────────────────────────────────────

export function isLiveMode() {
  return CONFIG.apiKey && CONFIG.apiKey.length > 0;
}

export function getProviderName() {
  if (!isLiveMode()) return "Mock Mode (Latin)";
  return CONFIG.provider.charAt(0).toUpperCase() + CONFIG.provider.slice(1);
}

/**
 * Generate a wiki article for the given topic.
 * @param {string} topic - The topic title
 * @param {Object} loreLedger - The existing lore (map of title -> article summary)
 * @returns {Promise<string>} The generated markdown article
 */
export async function generateArticle(topic, loreLedger = {}) {
  // Build context summary from existing lore
  const existingTopics = Object.keys(loreLedger);
  let contextBlock = "";
  if (existingTopics.length > 0) {
    const summaries = existingTopics
      .slice(-30) // last 30 topics for context window management
      .map((t) => `- "${t}": ${loreLedger[t].summary || "no summary"}`)
      .join("\n");
    contextBlock = `\n\nEXISTING LORE (reference these for consistency):\n${summaries}`;
  }

  const prompt = `Write a complete encyclopedia article about: "${topic}"

This article is part of The Atlas of Nowhere. Follow the format specified in your instructions exactly.${contextBlock}`;

  if (!isLiveMode()) {
    // Mock mode — simulate network delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
    return generateMockArticle(topic);
  }

  // Live mode
  const callers = {
    anthropic: callAnthropic,
    openai: callOpenAI,
    gemini: callGemini,
  };

  const caller = callers[CONFIG.provider];
  if (!caller) throw new Error(`Unknown provider: ${CONFIG.provider}`);

  return caller(prompt, contextBlock);
}

/**
 * Extract a short summary from article text (first sentence).
 */
export function extractSummary(markdown) {
  const firstLine = markdown.split("\n").find((l) => l.trim().length > 20 && !l.startsWith("#") && !l.startsWith(":::"));
  if (!firstLine) return "An entry in the Atlas of Nowhere.";
  return firstLine.trim().slice(0, 150).replace(/\[\[|\]\]/g, "") + "...";
}
