// ============================================================
// WIKI PARSER — services/parser.js
// ============================================================
// Converts [[wiki links]] and :::infobox blocks into structured data.

/**
 * Parse an infobox from the markdown text.
 * Returns { infobox: Object|null, bodyWithoutInfobox: string }
 */
export function extractInfobox(markdown) {
  const infoboxRegex = /:::infobox\n([\s\S]*?):::/;
  const match = markdown.match(infoboxRegex);

  if (!match) return { infobox: null, body: markdown };

  const lines = match[1].trim().split("\n");
  const infobox = {};
  lines.forEach((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      if (key && value) infobox[key] = value;
    }
  });

  const body = markdown.replace(infoboxRegex, "").trim();
  return { infobox, body };
}

/**
 * Extract all [[Topic]] links from markdown.
 */
export function extractLinks(markdown) {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const links = new Set();
  let m;
  while ((m = linkRegex.exec(markdown)) !== null) {
    links.add(m[1]);
  }
  return Array.from(links);
}

/**
 * Build a table of contents from ## headers.
 */
export function extractTOC(markdown) {
  const headerRegex = /^##\s+(.+)$/gm;
  const toc = [];
  let m;
  while ((m = headerRegex.exec(markdown)) !== null) {
    const text = m[1].replace(/\[\[|\]\]/g, "");
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    toc.push({ text, id });
  }
  return toc;
}

/**
 * Parse markdown into an array of renderable blocks.
 * Each block: { type: 'paragraph'|'heading'|'list'|'listItem', content: string, id?: string }
 * Content may contain [[wiki links]] which are preserved for the React renderer.
 */
export function parseMarkdown(markdown) {
  const lines = markdown.split("\n");
  const blocks = [];
  let currentList = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      continue;
    }

    // Heading
    if (trimmed.startsWith("## ")) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      const text = trimmed.slice(3);
      const id = text
        .replace(/\[\[|\]\]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-+$/, "");
      blocks.push({ type: "heading", content: text, id });
      continue;
    }

    // List item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.slice(2);
      if (!currentList) {
        currentList = { type: "list", items: [] };
      }
      currentList.items.push(content);
      continue;
    }

    // Paragraph
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
    blocks.push({ type: "paragraph", content: trimmed });
  }

  if (currentList) blocks.push(currentList);

  return blocks;
}

/**
 * Split inline text into segments: plain text and [[links]].
 * Returns array of { type: 'text'|'link', content: string }
 */
export function splitInlineLinks(text) {
  const parts = [];
  const regex = /\[\[([^\]]+)\]\]/g;
  let lastIdx = 0;
  let m;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push({ type: "text", content: text.slice(lastIdx, m.index) });
    }
    parts.push({ type: "link", content: m[1] });
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push({ type: "text", content: text.slice(lastIdx) });
  }

  return parts;
}

/**
 * Apply bold and italic markdown within plain text.
 * Returns HTML string for dangerouslySetInnerHTML or can be parsed further.
 */
export function applyInlineFormatting(text) {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}
