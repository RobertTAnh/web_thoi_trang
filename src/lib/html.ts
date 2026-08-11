/** Detect HTML markup in product/content strings. */
export function looksLikeHtml(input: string) {
  return /<[a-z][\s\S]*>/i.test(input);
}

/** Strip dangerous tags/attrs from trusted admin/Sapo HTML. */
export function sanitizeHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Normalize Sapo/Excel HTML for nicer storefront display.
 * Safe to run in batch on DB rows.
 */
export function beautifyProductHtml(input: string | null | undefined): string | null {
  if (!input) return null;
  let html = input.trim();
  if (!html) return null;

  // Double-escaped from some exports: &lt;p&gt;...
  if (/&lt;[a-z]/i.test(html) && !/<[a-z]/i.test(html)) {
    html = html
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  html = sanitizeHtml(html)
    // collapse empty paragraphs / nbsp-only blocks
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    // normalize breaks
    .replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br /><br />")
    // tidy spaces around nbsp
    .replace(/(?:&nbsp;){2,}/g, "&nbsp;")
    .trim();

  // Plain text → wrap paragraphs
  if (!looksLikeHtml(html)) {
    html = html
      .split(/\n{2,}/)
      .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
      .join("");
  }

  return html || null;
}
