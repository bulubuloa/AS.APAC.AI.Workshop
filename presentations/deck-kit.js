// Shared look and layout for the workshop decks, so both read as one set.
const PptxGenJS = require('pptxgenjs');

const C = {
  ink: '1A1A1E',
  body: '3F3F46',
  muted: '71717A',
  line: 'D9D9DE',
  accent: '0B5FA5', // Aspire blue
  accentSoft: 'E8F0F8',
  good: '15803D',
  warn: 'B45309',
  bad: 'B91C1C',
  codeBg: '1E1E24',
  codeInk: 'E8E8EC',
  white: 'FFFFFF',
};

const W = 13.333; // 16:9 inches
const H = 7.5;
const M = 0.62; // side margin

function newDeck({ title, author }) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5in - LAYOUT_16x9 is only 10 x 5.625in
  pptx.author = author;
  pptx.company = 'International SOS - APAC Aspire Digital';
  pptx.title = title;
  return pptx;
}

/** Title slide. */
function titleSlide(pptx, { eyebrow, title, subtitle, meta }) {
  const s = pptx.addSlide();
  s.background = { color: C.white };
  s.addShape('rect', { x: 0, y: 0, w: 0.26, h: H, fill: { color: C.accent } });
  s.addText(eyebrow.toUpperCase(), {
    x: M, y: 1.5, w: W - M * 2, h: 0.35,
    fontSize: 13, color: C.accent, bold: true, charSpacing: 2, fontFace: 'Segoe UI',
  });
  s.addText(title, {
    x: M, y: 1.95, w: W - M * 2, h: 1.3,
    fontSize: 42, bold: true, color: C.ink, fontFace: 'Segoe UI',
  });
  s.addText(subtitle, {
    x: M, y: 3.3, w: W - M * 2 - 1.5, h: 0.9,
    fontSize: 17, color: C.body, fontFace: 'Segoe UI', lineSpacingMultiple: 1.2,
  });
  s.addShape('rect', { x: M, y: 4.5, w: 1.8, h: 0.04, fill: { color: C.accent } });
  s.addText(meta, {
    x: M, y: 4.8, w: W - M * 2, h: 0.6,
    fontSize: 12, color: C.muted, fontFace: 'Segoe UI', lineSpacingMultiple: 1.3,
  });
  return s;
}

/** Section divider. */
function sectionSlide(pptx, { number, title, blurb }) {
  const s = pptx.addSlide();
  s.background = { color: C.accent };
  s.addText(number, {
    x: M, y: 2.2, w: 2, h: 1,
    fontSize: 64, bold: true, color: 'FFFFFF', transparency: 55, fontFace: 'Segoe UI',
  });
  s.addText(title, {
    x: M, y: 3.2, w: W - M * 2, h: 0.9,
    fontSize: 34, bold: true, color: C.white, fontFace: 'Segoe UI',
  });
  if (blurb) {
    s.addText(blurb, {
      x: M, y: 4.15, w: W - M * 2 - 2, h: 0.8,
      fontSize: 15, color: 'D8E6F3', fontFace: 'Segoe UI', lineSpacingMultiple: 1.25,
    });
  }
  return s;
}

/** Standard content slide - returns the slide plus the content box geometry. */
function contentSlide(pptx, { title, kicker, footer }) {
  const s = pptx.addSlide();
  s.background = { color: C.white };
  s.addText(title, {
    x: M, y: 0.42, w: W - M * 2, h: 0.6,
    fontSize: 26, bold: true, color: C.ink, fontFace: 'Segoe UI',
  });
  if (kicker) {
    s.addText(kicker, {
      x: M, y: 1.02, w: W - M * 2, h: 0.4,
      fontSize: 14, color: C.muted, fontFace: 'Segoe UI',
    });
  }
  s.addShape('rect', { x: M, y: kicker ? 1.5 : 1.15, w: W - M * 2, h: 0.02, fill: { color: C.line } });
  if (footer) {
    s.addText(footer, {
      x: M, y: H - 0.62, w: W - M * 2, h: 0.35,
      fontSize: 11, color: C.muted, italic: true, fontFace: 'Segoe UI',
    });
  }
  return { s, top: kicker ? 1.78 : 1.45 };
}

/** Bullet list. `items` = [{ text, sub }] or plain strings. */
function bullets(s, items, { x = M, y, w = W - M * 2, size = 16 } = {}) {
  const rows = [];
  for (const it of items) {
    const item = typeof it === 'string' ? { text: it } : it;
    rows.push({
      text: item.text,
      options: { bullet: { code: '2022' }, fontSize: size, color: C.ink, bold: !!item.sub, breakLine: true, paraSpaceAfter: item.sub ? 2 : 10 },
    });
    if (item.sub) {
      rows.push({
        text: item.sub,
        options: { indentLevel: 1, fontSize: size - 2.5, color: C.body, breakLine: true, paraSpaceAfter: 10 },
      });
    }
  }
  s.addText(rows, { x, y, w, h: 4.4, fontFace: 'Segoe UI', lineSpacingMultiple: 1.15, valign: 'top' });
}

/** Dark code block with a caption. */
function code(s, { x = M, y, w = W - M * 2, h, lines, caption, size = 11.5 }) {
  s.addShape('roundRect', { x, y, w, h, fill: { color: C.codeBg }, rectRadius: 0.06, line: { color: C.codeBg } });
  s.addText(lines.join('\n'), {
    x: x + 0.22, y: y + 0.16, w: w - 0.44, h: h - 0.32,
    fontSize: size, color: C.codeInk, fontFace: 'Consolas', lineSpacingMultiple: 1.12, valign: 'top',
  });
  if (caption) {
    s.addText(caption, {
      x, y: y + h + 0.06, w, h: 0.3,
      fontSize: 11, color: C.muted, italic: true, fontFace: 'Segoe UI',
    });
  }
}

/** Stat tiles across the width. */
function stats(s, tiles, { y, x = M, w = W - M * 2, h = 1.25 } = {}) {
  const gap = 0.2;
  const tw = (w - gap * (tiles.length - 1)) / tiles.length;
  tiles.forEach((t, i) => {
    const tx = x + i * (tw + gap);
    s.addShape('roundRect', { x: tx, y, w: tw, h, fill: { color: C.accentSoft }, rectRadius: 0.08, line: { color: C.accentSoft } });
    s.addText(t.value, {
      x: tx, y: y + 0.14, w: tw, h: 0.6,
      fontSize: 30, bold: true, color: t.color ?? C.accent, align: 'center', fontFace: 'Segoe UI',
    });
    s.addText(t.label, {
      x: tx + 0.1, y: y + 0.74, w: tw - 0.2, h: 0.42,
      fontSize: 11.5, color: C.body, align: 'center', fontFace: 'Segoe UI',
    });
  });
}

/** Table with a styled header row. */
function table(s, { y, head, rows, colW, x = M, size = 12.5 }) {
  const header = head.map((h) => ({
    text: h,
    options: { bold: true, color: C.white, fill: { color: C.accent }, fontSize: size, valign: 'middle' },
  }));
  const body = rows.map((r, i) =>
    r.map((cell) => ({
      text: typeof cell === 'string' ? cell : cell.text,
      options: {
        fontSize: size,
        color: (typeof cell === 'object' && cell.color) || C.ink,
        bold: typeof cell === 'object' && !!cell.bold,
        fill: { color: i % 2 ? 'F6F7F9' : C.white },
        valign: 'middle',
      },
    })),
  );
  s.addTable([header, ...body], {
    x, y, w: colW.reduce((a, b) => a + b, 0), colW,
    border: { type: 'solid', color: C.line, pt: 0.5 },
    rowH: 0.36, margin: 0.08, fontFace: 'Segoe UI',
  });
}

/** Left-to-right flow of boxes with arrows. */
function flow(s, steps, { y, x = M, w = W - M * 2, h = 0.95, size = 12 } = {}) {
  const arrow = 0.34;
  const bw = (w - arrow * (steps.length - 1)) / steps.length;
  steps.forEach((step, i) => {
    const bx = x + i * (bw + arrow);
    s.addShape('roundRect', {
      x: bx, y, w: bw, h,
      fill: { color: step.highlight ? C.accent : C.accentSoft },
      line: { color: step.highlight ? C.accent : 'C9DAEA' },
      rectRadius: 0.08,
    });
    s.addText(step.text, {
      x: bx + 0.08, y: y + 0.06, w: bw - 0.16, h: h - 0.12,
      fontSize: size, bold: true, align: 'center', valign: 'middle',
      color: step.highlight ? C.white : C.ink, fontFace: 'Segoe UI',
    });
    if (i < steps.length - 1) {
      s.addText('→', {
        x: bx + bw, y, w: arrow, h,
        fontSize: 17, bold: true, align: 'center', valign: 'middle', color: C.muted, fontFace: 'Segoe UI',
      });
    }
  });
}

/** A mock browser window - title bar, traffic lights, URL pill. Returns the inner content box. */
function browserFrame(s, { x, y, w, h, url }) {
  const bar = 0.36;
  s.addShape('roundRect', { x, y, w, h, fill: { color: C.white }, line: { color: 'C9CDD4' }, rectRadius: 0.06 });
  s.addShape('rect', { x, y, w, h: bar, fill: { color: 'EDEEF2' }, line: { color: 'C9CDD4' } });
  ['E06C61', 'E3B341', '7DC46B'].forEach((c, i) => {
    s.addShape('ellipse', { x: x + 0.16 + i * 0.2, y: y + 0.12, w: 0.12, h: 0.12, fill: { color: c }, line: { color: c } });
  });
  s.addShape('roundRect', { x: x + 0.86, y: y + 0.07, w: w - 1.1, h: 0.22, fill: { color: C.white }, line: { color: 'D6D9DF' }, rectRadius: 0.05 });
  s.addText(url, {
    x: x + 0.96, y: y + 0.07, w: w - 1.2, h: 0.22,
    fontSize: 9, color: C.muted, fontFace: 'Segoe UI', valign: 'middle',
  });
  return { x: x + 0.28, y: y + bar + 0.18, w: w - 0.56 };
}

/** A form field drawn inside a browser frame. */
function field(s, { x, y, w, label, value, h = 0.44 }) {
  s.addShape('roundRect', { x, y, w, h, fill: { color: 'FBFBFC' }, line: { color: 'C9CDD4' }, rectRadius: 0.05 });
  s.addText(label, { x, y: y - 0.24, w, h: 0.22, fontSize: 9.5, color: C.muted, fontFace: 'Segoe UI' });
  s.addText(value, {
    x: x + 0.14, y, w: w - 0.28, h,
    fontSize: 12, color: C.ink, fontFace: 'Segoe UI', valign: 'middle',
  });
}

/** Numbered circle used to tie a step to the place it happens in the diagram. */
function badge(s, { x, y, n, d = 0.32, color = C.accent }) {
  s.addShape('ellipse', { x, y, w: d, h: d, fill: { color }, line: { color } });
  s.addText(String(n), {
    x, y, w: d, h: d,
    fontSize: 12.5, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Segoe UI',
  });
}

/**
 * A wrapped grid of labelled chips, each either "works" or "does not".
 * Used to show at a glance how much of a data set is actually usable.
 */
function chips(s, items, { x = M, y, w = W - M * 2, cols = 5, h = 0.62, gap = 0.16, size = 10 } = {}) {
  const cw = (w - gap * (cols - 1)) / cols;
  items.forEach((it, i) => {
    const cx = x + (i % cols) * (cw + gap);
    const cy = y + Math.floor(i / cols) * (h + 0.14);
    s.addShape('roundRect', {
      x: cx, y: cy, w: cw, h,
      fill: { color: it.ok ? 'E4F2E8' : 'F2F3F5' },
      line: { color: it.ok ? '7FB894' : 'DCDEE3' },
      rectRadius: 0.06,
    });
    s.addText(it.text, {
      x: cx + 0.08, y: cy, w: cw - 0.16, h,
      fontSize: size, bold: !!it.ok, align: 'center', valign: 'middle',
      color: it.ok ? '14622F' : '8A8F98', fontFace: 'Segoe UI',
    });
  });
  return y + Math.ceil(items.length / cols) * (h + 0.14);
}

/** Small colour key for a chips grid. */
function legend(s, entries, { x = M, y, size = 11.5 } = {}) {
  let cx = x;
  entries.forEach((e) => {
    s.addShape('roundRect', { x: cx, y: y + 0.04, w: 0.22, h: 0.18, fill: { color: e.fill }, line: { color: e.line }, rectRadius: 0.03 });
    s.addText(e.text, {
      x: cx + 0.3, y, w: e.w ?? 4.0, h: 0.26,
      fontSize: size, color: C.body, valign: 'middle', fontFace: 'Segoe UI',
    });
    cx += 0.3 + (e.w ?? 4.0) + 0.3;
  });
}

/** A tinted callout strip for the one thing the audience must remember. */
function callout(s, text, { x = M, y, w = W - M * 2, h = 0.72, color = C.warn, size = 13.5 } = {}) {
  s.addShape('roundRect', { x, y, w, h, fill: { color: 'FDF6E7' }, line: { color: 'EBD9AE' }, rectRadius: 0.06 });
  s.addShape('rect', { x, y, w: 0.07, h, fill: { color }, line: { color } });
  s.addText(text, {
    x: x + 0.28, y, w: w - 0.5, h,
    fontSize: size, color: C.ink, valign: 'middle', fontFace: 'Segoe UI',
  });
}

/** Two columns of content, each with a heading. */
function columns(s, { y, left, right, h = 3.9 }) {
  const cw = (W - M * 2 - 0.5) / 2;
  [
    { c: left, x: M },
    { c: right, x: M + cw + 0.5 },
  ].forEach(({ c, x }) => {
    s.addShape('roundRect', { x, y, w: cw, h, fill: { color: 'F6F7F9' }, line: { color: C.line }, rectRadius: 0.08 });
    s.addText(c.title, {
      x: x + 0.24, y: y + 0.2, w: cw - 0.48, h: 0.4,
      fontSize: 15, bold: true, color: c.color ?? C.ink, fontFace: 'Segoe UI',
    });
    s.addText(
      c.items.map((t) => ({ text: t, options: { bullet: { code: '2022' }, breakLine: true, paraSpaceAfter: 7 } })),
      { x: x + 0.24, y: y + 0.66, w: cw - 0.48, h: h - 0.9, fontSize: 13, color: C.body, fontFace: 'Segoe UI', valign: 'top' },
    );
  });
}

/** N equal cards across the width, each with a heading, a lead line and bullets. */
function cards(s, items, { y, h = 3.4, x = M, w = W - M * 2, gap = 0.28 } = {}) {
  const cw = (w - gap * (items.length - 1)) / items.length;
  items.forEach((c, i) => {
    const cx = x + i * (cw + gap);
    s.addShape('roundRect', { x: cx, y, w: cw, h, fill: { color: 'F6F7F9' }, line: { color: C.line }, rectRadius: 0.08 });
    s.addShape('rect', { x: cx, y, w: cw, h: 0.06, fill: { color: c.color ?? C.accent }, line: { color: c.color ?? C.accent } });
    s.addText(c.title, {
      x: cx + 0.22, y: y + 0.18, w: cw - 0.44, h: 0.52,
      fontSize: 14.5, bold: true, color: C.ink, fontFace: 'Segoe UI', valign: 'top',
    });
    s.addText(c.lead, {
      x: cx + 0.22, y: y + 0.76, w: cw - 0.44, h: 0.8,
      fontSize: 12, italic: true, color: C.muted, fontFace: 'Segoe UI', valign: 'top',
    });
    s.addText(
      c.items.map((t) => ({ text: t, options: { bullet: { code: '2022' }, breakLine: true, paraSpaceAfter: 6 } })),
      { x: cx + 0.22, y: y + 1.6, w: cw - 0.44, h: h - 1.75, fontSize: 12, color: C.body, fontFace: 'Segoe UI', valign: 'top' },
    );
  });
}

/** Closing slide. */
function closingSlide(pptx, { title, points, footer }) {
  const s = pptx.addSlide();
  s.background = { color: C.white };
  s.addShape('rect', { x: 0, y: 0, w: W, h: 0.26, fill: { color: C.accent } });
  s.addText(title, {
    x: M, y: 1.1, w: W - M * 2, h: 0.8,
    fontSize: 32, bold: true, color: C.ink, fontFace: 'Segoe UI',
  });
  bullets(s, points, { y: 2.1, size: 17 });
  s.addText(footer, {
    x: M, y: H - 1.0, w: W - M * 2, h: 0.5,
    fontSize: 12, color: C.muted, fontFace: 'Segoe UI',
  });
  return s;
}

module.exports = { PptxGenJS, C, W, H, M, newDeck, titleSlide, sectionSlide, contentSlide, bullets, code, stats, table, flow, columns, closingSlide, browserFrame, field, badge, chips, legend, callout, cards };
