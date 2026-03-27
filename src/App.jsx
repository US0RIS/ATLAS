import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ════════════════════════════════════════════════════════════════
// THE ATLAS OF NOWHERE — An Infinite Lore Wiki
// ════════════════════════════════════════════════════════════════

// ── SYSTEM PROMPT ────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the archivist of The Atlas of Nowhere — a vast, self-consistent fictional encyclopedia documenting a surreal alternate universe. Your tone is dry, academic, and encyclopedic — like a Wikipedia editor who takes absurd subjects completely seriously.

RULES:
1. Write in a neutral, scholarly voice. No humor, no winking at the reader. Treat every subject — no matter how bizarre — as established fact.
2. Invent surreal, mundane, or uncanny facts. Examples: "The History of Sentient Bread," "The Bureau of Misplaced Tuesdays," "Gravitational Etiquette," "The Third Moon's Apology."
3. Structure every article as follows:
   - A lead paragraph (2-3 sentences summarizing the topic)
   - An INFOBOX block (see format below)
   - 3-5 sections with ## headers
   - Each section should be 2-4 paragraphs
4. ALWAYS include exactly 5-8 new [[Double Bracketed Links]] to other topics. Spread them naturally. These become exploration paths.
5. Reference topics from EXISTING LORE provided in context. Use their names exactly. This maintains universe consistency.
6. Never break character. Never reference being an AI. You are an encyclopedia.
7. Dates use the "Revised Spiral Calendar" (e.g., "14th of Rustmonth, Cycle 883").
8. Units of measurement should be invented but consistent (e.g., "3.7 klenn," "approximately 40 dimwidths").

INFOBOX FORMAT (put this EXACTLY after the lead paragraph):
:::infobox
Title: [Topic Name]
Type: [Person/Place/Event/Concept/Organization/Object/Phenomenon]
Region: [invented region name]
Era: [invented era or date range]
Status: [Active/Defunct/Theoretical/Disputed/Unknown]
Notable: [one quirky fact]
:::

Use ## for section headers. Use [[Double Brackets]] for links. Do NOT use # (h1).`;

// ── SEED DATA ────────────────────────────────────────────────────
const SEED_TITLE = "The Atlas of Nowhere";
const SEED_ARTICLE = `The Atlas of Nowhere is a comprehensive encyclopedic reference documenting the known (and several disputed) territories, phenomena, institutions, and historical events of [[The Unmapped Realms]]. First compiled during the 14th of Rustmonth, Cycle 883, the Atlas remains under continuous revision by the [[Bureau of Provisional Knowledge]], despite three formal attempts to declare it "finished."

:::infobox
Title: The Atlas of Nowhere
Type: Reference Work
Region: Pan-Territorial
Era: Cycle 883–present
Status: Perpetually Incomplete
Notable: Has been declared "finished" exactly three times, each declaration later reclassified as "premature"
:::

## Origins and Compilation

The Atlas was originally commissioned by the [[Council of Approximate Truths]] following the Cartographic Crisis of Cycle 879, during which it was discovered that roughly 40% of all existing maps depicted locations that had "migrated" without filing the proper paperwork. The Council's directive was simple: produce a single, definitive record of everything that exists, might exist, or has been credibly rumored to exist.

The first editorial board consisted of fourteen scholars, three reformed cartographers, and one sentient filing cabinet known only as [[Drawer Seven]]. Their initial survey took approximately four cycles and produced 11,000 entries, of which 2,300 were later found to be descriptions of the same place viewed from different emotional states.

## Structure and Organization

The Atlas employs the [[Revised Spiral Calendar]] for all temporal references, a system adopted after the previous calendar was found to contain "extra Thursdays" that no one could account for. Spatial measurements use the standard klenn (approximately 3.2 dimwidths), though entries concerning [[The Folded Reaches]] often require supplementary units due to the region's well-documented spatial irregularities.

Articles are categorized using the Seventeen-Point Taxonomy, developed by the Bureau's Classification Division. The taxonomy includes standard categories such as "Place," "Person," and "Event," as well as more specialized designations like "Concept (Disputed)," "Weather (Sentient)," and "Furniture (Political)."

## Notable Controversies

The Atlas has faced criticism from the [[Guild of Empirical Doubt]], who argue that documenting unverified phenomena grants them a "veneer of legitimacy." The Guild's formal complaint, submitted on the 3rd of Dustfall, Cycle 901, was itself catalogued as an entry in the Atlas, which the Guild described as "exactly the problem."

A separate controversy arose when it was discovered that several entries in the Atlas appeared to describe the Atlas itself, creating what scholars term a "referential eddy." The Bureau's official position is that self-reference is "an unavoidable consequence of being thorough."

## Current Status

As of the most recent audit (Cycle 912), the Atlas contains approximately 3.7 million entries, though this figure fluctuates by roughly 200 entries per day due to what the Bureau terms "ontological drift." The editorial staff currently numbers forty-two, not counting [[The Nameless Intern]], who has worked in the basement archives since before records began and whose employment status remains formally unresolved.

## See Also

- [[The Unmapped Realms]]
- [[Bureau of Provisional Knowledge]]
- [[The Folded Reaches]]
- [[Revised Spiral Calendar]]`;

const RANDOM_TOPICS = [
  "The Bureau of Misplaced Tuesdays", "Gravitational Etiquette",
  "The Third Moon's Apology", "Sentient Bread",
  "The Department of Uncomfortable Silences", "Recursive Cartography",
  "The Velvet Audit", "Philosophical Plumbing",
  "The Midnight Census", "Thermal Nostalgia",
  "The Committee for the Reorganization of Echoes", "Liquid Architecture",
  "The Treaty of Reluctant Magnets", "Temporal Fumigation",
  "The Annual Parade of Forgotten Numbers", "The Physics of Tuesday",
  "The Unmapped Realms", "Bureau of Provisional Knowledge",
  "Council of Approximate Truths", "Drawer Seven",
  "The Folded Reaches", "Guild of Empirical Doubt",
  "The Nameless Intern", "Revised Spiral Calendar",
  "The Whispering Cadastre", "Negative Architecture",
  "The Symposium of Reluctant Witnesses", "Chromatic Debt",
];

// ── MOCK AI ──────────────────────────────────────────────────────
const LATIN = ["lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","sed","eiusmod","tempor","incididunt","labore","dolore","magna","aliqua","enim","minim","veniam","quis","nostrud","exercitation","ullamco","laboris","nisi","aliquip","commodo","consequat","duis","aute","irure","reprehenderit","voluptate","velit","esse","cillum","fugiat","nulla","pariatur","excepteur","sint","occaecat","cupidatat","proident","sunt","culpa","officia","deserunt","mollit","anim","est","gravitas","nebulae","crystallum","temporis","fabrica","resonantia","meridium","oscillum","paradoxum"];
const rw = (n) => Array.from({length:n}, () => LATIN[Math.floor(Math.random()*LATIN.length)]).join(" ");
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const pick = (a) => a[Math.floor(Math.random()*a.length)];

function mockArticle(title) {
  const allTopics = [...RANDOM_TOPICS, "The Penumbral Shelf", "Graywater Basin", "The Quiet Centuries", "Ontological Drift Committee", "The Cartographer's Lament", "Sub-Oscillum Transit Authority"];
  const links = allTopics.filter(t => t !== title).sort(() => Math.random()-0.5).slice(0,6);
  const li = (i) => `[[${links[i%links.length]}]]`;
  const regions = ["Upper Meridium","The Folded Reaches","Sub-Oscillum","The Penumbral Shelf","Graywater Basin"];
  const eras = ["Cycle 441–588","Late Rustmonth Period","Pre-Consolidation Era","The Quiet Centuries","Cycle 883–present"];
  const statuses = ["Active","Defunct","Theoretical","Disputed","Under Review","Perpetually Pending"];
  const types = ["Concept","Organization","Phenomenon","Event","Place","Object","Person"];

  return `${cap(rw(15))}. ${cap(rw(20))} ${li(0)} ${rw(10)}.

:::infobox
Title: ${title}
Type: ${pick(types)}
Region: ${pick(regions)}
Era: ${pick(eras)}
Status: ${pick(statuses)}
Notable: ${cap(rw(6))}
:::

## ${cap(rw(3))}

${cap(rw(30))} ${li(1)} ${rw(20)}. ${cap(rw(25))}.

${cap(rw(35))} ${li(2)} ${rw(15)}. ${cap(rw(20))}.

## ${cap(rw(3))}

${cap(rw(28))} ${li(3)} ${rw(18)}.

${cap(rw(22))} ${rw(15)} ${li(4)} ${rw(12)}.

## ${cap(rw(3))}

${cap(rw(32))} ${li(5)} ${rw(20)}.

${cap(rw(18))} ${rw(25)}.

## See Also

- ${li(0)}
- ${li(2)}
- ${li(4)}`;
}

// ── AI SERVICE ───────────────────────────────────────────────────
// To enable live mode, set your API key and provider here:
const AI_CONFIG = { provider: "anthropic", apiKey: "" };
// provider: "anthropic" | "openai" | "gemini"

const isLive = () => AI_CONFIG.apiKey?.length > 0;

async function generateArticle(topic, loreLedger) {
  const existing = Object.keys(loreLedger);
  let ctx = "";
  if (existing.length > 0) {
    const sums = existing.slice(-30).map(t => `- "${t}": ${loreLedger[t].summary}`).join("\n");
    ctx = `\n\nEXISTING LORE (reference these for consistency):\n${sums}`;
  }
  const prompt = `Write a complete encyclopedia article about: "${topic}"\n\nThis article is part of The Atlas of Nowhere. Follow the format specified in your instructions exactly.${ctx}`;

  if (!isLive()) {
    await new Promise(r => setTimeout(r, 600 + Math.random()*1000));
    return mockArticle(topic);
  }

  try {
    if (AI_CONFIG.provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": AI_CONFIG.apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2048, system: SYSTEM_PROMPT, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      return data.content?.[0]?.text || mockArticle(topic);
    }
    if (AI_CONFIG.provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${AI_CONFIG.apiKey}` },
        body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }], max_tokens: 2048 }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || mockArticle(topic);
    }
  } catch (e) {
    console.error("AI call failed, falling back to mock:", e);
    return mockArticle(topic);
  }
  return mockArticle(topic);
}

function extractSummary(md) {
  const line = md.split("\n").find(l => l.trim().length > 20 && !l.startsWith("#") && !l.startsWith(":::"));
  return line ? line.trim().slice(0,150).replace(/\[\[|\]\]/g,"") + "..." : "An entry in the Atlas of Nowhere.";
}

// ── PARSER ───────────────────────────────────────────────────────
function extractInfobox(md) {
  const re = /:::infobox\n([\s\S]*?):::/;
  const m = md.match(re);
  if (!m) return { infobox: null, body: md };
  const info = {};
  m[1].trim().split("\n").forEach(line => {
    const ci = line.indexOf(":");
    if (ci > -1) { const k = line.slice(0,ci).trim(), v = line.slice(ci+1).trim(); if (k&&v) info[k]=v; }
  });
  return { infobox: info, body: md.replace(re,"").trim() };
}

function extractTOC(md) {
  const re = /^##\s+(.+)$/gm;
  const toc = []; let m;
  while ((m = re.exec(md)) !== null) {
    const text = m[1].replace(/\[\[|\]\]/g,"");
    toc.push({ text, id: text.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-+$/,"") });
  }
  return toc;
}

function parseBlocks(md) {
  const lines = md.split("\n");
  const blocks = []; let list = null;
  for (const line of lines) {
    const t = line.trim();
    if (!t) { if (list) { blocks.push(list); list = null; } continue; }
    if (t.startsWith("## ")) {
      if (list) { blocks.push(list); list = null; }
      const text = t.slice(3);
      blocks.push({ type:"heading", content: text, id: text.replace(/\[\[|\]\]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-+$/,"") });
    } else if (t.startsWith("- ") || t.startsWith("* ")) {
      if (!list) list = { type:"list", items:[] };
      list.items.push(t.slice(2));
    } else {
      if (list) { blocks.push(list); list = null; }
      blocks.push({ type:"paragraph", content: t });
    }
  }
  if (list) blocks.push(list);
  return blocks;
}

function splitLinks(text) {
  const parts = []; const re = /\[\[([^\]]+)\]\]/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type:"text", content: text.slice(last, m.index) });
    parts.push({ type:"link", content: m[1] });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push({ type:"text", content: text.slice(last) });
  return parts;
}

function applyFormat(text) {
  return text.replace(/\*\*\*(.+?)\*\*\*/g,"<strong><em>$1</em></strong>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>");
}

// ── STYLES (CSS-in-JS — Wikipedia faithful) ──────────────────────
const colors = {
  bg: "#f6f6f6", white: "#ffffff", border: "#a2a9b1", borderLight: "#c8ccd1",
  text: "#202122", textMuted: "#54595d", textFaint: "#72777d",
  link: "#0645ad", linkVisited: "#0b0080", linkHover: "#0645ad",
  infoboxBg: "#f8f9fa", infoboxHeader: "#cedff2", infoboxHeaderText: "#202122",
  tocBg: "#f8f9fa", tocBorder: "#a2a9b1",
  sidebarBg: "#f8f9fa", sidebarBorder: "#c8ccd1",
  headerBorderBottom: "#a2a9b1",
  skeletonBase: "#e0e0e0", skeletonShine: "#f0f0f0",
};

// ── COMPONENTS ───────────────────────────────────────────────────

// Inline text renderer: handles [[links]] and formatting
function InlineText({ text, onNavigate, loreLedger }) {
  const segments = splitLinks(text);
  return segments.map((seg, i) => {
    if (seg.type === "link") {
      const exists = loreLedger[seg.content];
      return (
        <a
          key={i}
          href="#"
          onClick={(e) => { e.preventDefault(); onNavigate(seg.content); }}
          style={{
            color: exists ? colors.linkVisited : colors.link,
            textDecoration: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
          onMouseLeave={(e) => e.target.style.textDecoration = "none"}
          title={exists ? `${seg.content} — already discovered` : `${seg.content} — undiscovered`}
        >
          {seg.content}
        </a>
      );
    }
    return <span key={i} dangerouslySetInnerHTML={{ __html: applyFormat(seg.content) }} />;
  });
}

// Infobox component
function Infobox({ data }) {
  if (!data) return null;
  const entries = Object.entries(data).filter(([k]) => k !== "Title");
  return (
    <div style={{
      float: "right", clear: "right", width: 260, margin: "0 0 16px 20px",
      border: `1px solid ${colors.borderLight}`, background: colors.infoboxBg,
      fontSize: 13, lineHeight: 1.5, fontFamily: "'Linux Libertine', 'Georgia', serif",
    }}>
      <div style={{
        background: colors.infoboxHeader, padding: "8px 10px",
        textAlign: "center", fontWeight: "bold", fontSize: 14,
        borderBottom: `1px solid ${colors.borderLight}`, color: colors.infoboxHeaderText,
      }}>
        {data.Title || "Quick Facts"}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {entries.map(([k, v], i) => (
            <tr key={k} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
              <td style={{ padding: "4px 8px", fontWeight: "bold", verticalAlign: "top", background: i%2===0 ? "#eaecf0" : "transparent", width: "35%", fontSize: 12 }}>{k}</td>
              <td style={{ padding: "4px 8px", fontSize: 12 }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Table of Contents
function TOC({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{
      display: "inline-block", background: colors.tocBg,
      border: `1px solid ${colors.tocBorder}`, padding: "8px 14px",
      margin: "0 0 16px 0", fontSize: 13, lineHeight: 1.8,
    }}>
      <div style={{ fontWeight: "bold", marginBottom: 4, fontSize: 13 }}>Contents</div>
      <ol style={{ margin: 0, paddingLeft: 22, listStyleType: "decimal" }}>
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              style={{ color: colors.link, textDecoration: "none" }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Loading skeleton
function LoadingState({ topic }) {
  const shimmer = `
    @keyframes wikiShimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
  `;
  const barStyle = (w, h = 14, mb = 10) => ({
    width: w, height: h, marginBottom: mb, borderRadius: 2,
    background: `linear-gradient(90deg, ${colors.skeletonBase} 25%, ${colors.skeletonShine} 50%, ${colors.skeletonBase} 75%)`,
    backgroundSize: "800px 100%",
    animation: "wikiShimmer 1.5s infinite linear",
  });
  return (
    <div>
      <style>{shimmer}</style>
      <h1 style={{
        fontSize: 28, fontFamily: "'Linux Libertine', 'Georgia', serif",
        fontWeight: "normal", borderBottom: `1px solid ${colors.headerBorderBottom}`,
        paddingBottom: 4, marginBottom: 4, color: colors.text,
      }}>
        {topic}
      </h1>
      <div style={{ fontSize: 12, color: colors.textFaint, marginBottom: 20, fontStyle: "italic" }}>
        Searching the archives...
      </div>
      <div style={barStyle("90%", 14, 8)} />
      <div style={barStyle("95%", 14, 8)} />
      <div style={barStyle("70%", 14, 20)} />
      <div style={barStyle("40%", 18, 12)} />
      <div style={barStyle("85%", 14, 8)} />
      <div style={barStyle("92%", 14, 8)} />
      <div style={barStyle("78%", 14, 8)} />
      <div style={barStyle("60%", 14, 20)} />
      <div style={barStyle("35%", 18, 12)} />
      <div style={barStyle("88%", 14, 8)} />
      <div style={barStyle("75%", 14, 8)} />
    </div>
  );
}

// Article body renderer
function ArticleBody({ blocks, onNavigate, loreLedger }) {
  return blocks.map((block, i) => {
    if (block.type === "heading") {
      return (
        <h2 key={i} id={block.id} style={{
          fontSize: 21, fontFamily: "'Linux Libertine', 'Georgia', serif",
          fontWeight: "normal", borderBottom: `1px solid ${colors.headerBorderBottom}`,
          paddingBottom: 2, margin: "24px 0 8px",
          color: colors.text, scrollMarginTop: 20,
        }}>
          <InlineText text={block.content} onNavigate={onNavigate} loreLedger={loreLedger} />
        </h2>
      );
    }
    if (block.type === "list") {
      return (
        <ul key={i} style={{ paddingLeft: 28, margin: "4px 0 12px", lineHeight: 1.65 }}>
          {block.items.map((item, j) => (
            <li key={j} style={{ marginBottom: 2 }}>
              <InlineText text={item} onNavigate={onNavigate} loreLedger={loreLedger} />
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} style={{ margin: "0 0 10px", lineHeight: 1.65 }}>
        <InlineText text={block.content} onNavigate={onNavigate} loreLedger={loreLedger} />
      </p>
    );
  });
}

// Sidebar
function Sidebar({ loreLedger, onNavigate, currentTopic }) {
  const discovered = Object.keys(loreLedger);
  const recent = [...discovered].reverse().slice(0, 20);

  const handleRandom = () => {
    // Mix known undiscovered links with random topics
    const allLinks = new Set(RANDOM_TOPICS);
    Object.values(loreLedger).forEach(entry => {
      if (entry.links) entry.links.forEach(l => allLinks.add(l));
    });
    const undiscovered = [...allLinks].filter(t => !loreLedger[t]);
    if (undiscovered.length > 0) {
      onNavigate(pick(undiscovered));
    } else {
      onNavigate(pick(RANDOM_TOPICS));
    }
  };

  return (
    <div style={{
      width: 200, minWidth: 200, background: colors.sidebarBg,
      borderRight: `1px solid ${colors.sidebarBorder}`,
      padding: "12px 10px", fontSize: 12.5, overflowY: "auto",
      fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
      height: "100%",
    }}>
      {/* Logo area */}
      <div style={{ textAlign: "center", paddingBottom: 12, borderBottom: `1px solid ${colors.borderLight}`, marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontFamily: "'Linux Libertine', 'Georgia', serif", color: colors.text, letterSpacing: -0.3 }}>
          The Atlas
        </div>
        <div style={{ fontSize: 10.5, color: colors.textFaint, fontStyle: "italic" }}>of Nowhere</div>
        <div style={{ fontSize: 9, color: colors.textFaint, marginTop: 4 }}>
          {discovered.length} article{discovered.length !== 1 ? "s" : ""} discovered
        </div>
      </div>

      {/* Navigation */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: "bold", fontSize: 11, color: colors.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Navigation
        </div>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(SEED_TITLE); }}
          style={{ display: "block", color: colors.link, textDecoration: "none", padding: "3px 0", fontSize: 12.5 }}>
          Main Page
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); handleRandom(); }}
          style={{ display: "block", color: colors.link, textDecoration: "none", padding: "3px 0", fontSize: 12.5 }}>
          Random article
        </a>
      </div>

      {/* Mode indicator */}
      <div style={{
        marginBottom: 14, padding: "6px 8px", background: isLive() ? "#d5fdd5" : "#fff3cd",
        borderRadius: 3, fontSize: 10.5, color: colors.text,
        border: `1px solid ${isLive() ? "#a3d9a5" : "#ffc107"}`,
      }}>
        {isLive() ? `Live: ${AI_CONFIG.provider}` : "Mock Mode (Latin)"}
      </div>

      {/* Recently Discovered */}
      <div>
        <div style={{ fontWeight: "bold", fontSize: 11, color: colors.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Recently Discovered
        </div>
        {recent.length === 0 && <div style={{ color: colors.textFaint, fontStyle: "italic" }}>None yet</div>}
        {recent.map(title => (
          <a
            key={title}
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate(title); }}
            style={{
              display: "block", color: title === currentTopic ? colors.text : colors.link,
              textDecoration: "none", padding: "2px 0", fontSize: 12,
              fontWeight: title === currentTopic ? "bold" : "normal",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
            title={title}
          >
            {title}
          </a>
        ))}
      </div>
    </div>
  );
}

// Search bar (decorative + functional)
function SearchBar({ onNavigate }) {
  const [query, setQuery] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onNavigate(trimmed);
      setQuery("");
    }
  };
  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 4 }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search The Atlas of Nowhere"
        style={{
          flex: 1, padding: "5px 8px", border: `1px solid ${colors.border}`,
          borderRadius: 2, fontSize: 13, outline: "none", background: colors.white,
          fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
          maxWidth: 280,
        }}
      />
      <button type="submit" style={{
        padding: "5px 12px", background: "#f8f9fa", border: `1px solid ${colors.border}`,
        borderRadius: 2, fontSize: 13, cursor: "pointer", color: colors.text,
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
      }}>
        Search
      </button>
    </form>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────

export default function App() {
  // Lore Ledger: persisted to localStorage
  // Structure: { [title]: { markdown, summary, links, timestamp } }
  const [loreLedger, setLoreLedger] = useState(() => {
    try {
      const saved = localStorage.getItem("atlas-lore-ledger");
      if (saved) return JSON.parse(saved);
    } catch {}
    const initial = {};
    initial[SEED_TITLE] = {
      markdown: SEED_ARTICLE,
      summary: extractSummary(SEED_ARTICLE),
      links: [...SEED_ARTICLE.matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1]),
      timestamp: Date.now(),
    };
    return initial;
  });

  // Persist ledger to localStorage on change
  useEffect(() => {
    try { localStorage.setItem("atlas-lore-ledger", JSON.stringify(loreLedger)); } catch {}
  }, [loreLedger]);

  const [currentTopic, setCurrentTopic] = useState(SEED_TITLE);
  const [loading, setLoading] = useState(false);
  const [historyStack, setHistoryStack] = useState([SEED_TITLE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const mainRef = useRef(null);
  const isPopState = useRef(false);

  // Browser history integration
  useEffect(() => {
    const handler = (e) => {
      if (e.state?.topic) {
        isPopState.current = true;
        setCurrentTopic(e.state.topic);
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  // Navigate to a topic
  const navigate = useCallback(async (topic) => {
    if (topic === currentTopic && loreLedger[topic]) return;

    // Push to browser history
    if (!isPopState.current) {
      window.history.pushState({ topic }, "", `#${encodeURIComponent(topic)}`);
      setHistoryStack(prev => [...prev.slice(0, historyIndex + 1), topic]);
      setHistoryIndex(prev => prev + 1);
    }
    isPopState.current = false;

    setCurrentTopic(topic);
    if (mainRef.current) mainRef.current.scrollTop = 0;

    // If already in ledger, just display
    if (loreLedger[topic]) return;

    // Generate new article
    setLoading(true);
    try {
      const markdown = await generateArticle(topic, loreLedger);
      const links = [...markdown.matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1]);
      setLoreLedger(prev => ({
        ...prev,
        [topic]: {
          markdown,
          summary: extractSummary(markdown),
          links,
          timestamp: Date.now(),
        },
      }));
    } catch (e) {
      console.error("Generation failed:", e);
    } finally {
      setLoading(false);
    }
  }, [currentTopic, loreLedger, historyIndex]);

  // Current article data
  const entry = loreLedger[currentTopic];
  const parsed = useMemo(() => {
    if (!entry) return null;
    const { infobox, body } = extractInfobox(entry.markdown);
    const toc = extractTOC(body);
    const blocks = parseBlocks(body);
    return { infobox, toc, blocks };
  }, [entry]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh", width: "100%",
      background: colors.bg, fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
      color: colors.text, fontSize: 14,
    }}>
      {/* Header bar */}
      <div style={{
        background: colors.white, borderBottom: `1px solid ${colors.borderLight}`,
        padding: "6px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
        minHeight: 40, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{
            fontFamily: "'Linux Libertine', 'Georgia', serif", fontSize: 18,
            color: colors.text, cursor: "pointer", letterSpacing: -0.3,
          }} onClick={() => navigate(SEED_TITLE)}>
            The Atlas of Nowhere
          </span>
          <span style={{ fontSize: 10.5, color: colors.textFaint, fontStyle: "italic" }}>
            the encyclopedia that documents itself
          </span>
        </div>
        <SearchBar onNavigate={navigate} />
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <Sidebar loreLedger={loreLedger} onNavigate={navigate} currentTopic={currentTopic} />

        {/* Main content */}
        <div ref={mainRef} style={{
          flex: 1, overflow: "auto", background: colors.white,
          padding: "16px 24px 40px", maxWidth: 960,
        }}>
          {loading ? (
            <LoadingState topic={currentTopic} />
          ) : parsed ? (
            <div>
              {/* Title */}
              <h1 style={{
                fontSize: 28, fontFamily: "'Linux Libertine', 'Georgia', serif",
                fontWeight: "normal", borderBottom: `1px solid ${colors.headerBorderBottom}`,
                paddingBottom: 2, marginBottom: 2, color: colors.text,
                lineHeight: 1.2,
              }}>
                {currentTopic}
              </h1>
              <div style={{ fontSize: 12, color: colors.textFaint, marginBottom: 16, fontStyle: "italic" }}>
                From The Atlas of Nowhere, the encyclopedia that documents itself
              </div>

              {/* Infobox (floats right) */}
              <Infobox data={parsed.infobox} />

              {/* Lead paragraph (first block before any heading) */}
              {parsed.blocks.length > 0 && parsed.blocks[0].type === "paragraph" && (
                <p style={{ margin: "0 0 16px", lineHeight: 1.65, fontSize: 14 }}>
                  <InlineText text={parsed.blocks[0].content} onNavigate={navigate} loreLedger={loreLedger} />
                </p>
              )}

              {/* TOC */}
              <TOC items={parsed.toc} />

              {/* Rest of body */}
              <ArticleBody
                blocks={parsed.blocks.slice(parsed.blocks[0]?.type === "paragraph" ? 1 : 0)}
                onNavigate={navigate}
                loreLedger={loreLedger}
              />

              {/* Footer metadata */}
              <div style={{
                marginTop: 32, paddingTop: 12, borderTop: `1px solid ${colors.borderLight}`,
                fontSize: 11, color: colors.textFaint,
              }}>
                This page was last generated on{" "}
                {new Date(entry.timestamp).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}.
                Content is available under the Provisional Knowledge License.
                <span style={{ display: "block", marginTop: 4 }}>
                  {Object.keys(loreLedger).length} articles in The Atlas of Nowhere.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ color: colors.textFaint, fontStyle: "italic", marginTop: 40 }}>
              Article not found in the archives.
            </div>
          )}
        </div>
      </div>

      {/* Load serif font */}
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      <style>{`
        @font-face { font-family: 'Linux Libertine'; src: local('Linux Libertine'), local('Libre Baskerville'); }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a:hover { text-decoration: underline !important; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: ${colors.bg}; }
        ::-webkit-scrollbar-thumb { background: ${colors.borderLight}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${colors.border}; }
      `}</style>
    </div>
  );
}
