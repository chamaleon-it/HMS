/**
 * Allow only bare <sup>/<sub> tags (common in lab units/ranges).
 * Strips attributes and all other HTML to reduce XSS risk from catalogue content.
 */
export function sanitizeLabHtml(input: string | null | undefined): string {
  if (!input) return "";
  const withoutDangerous = String(input)
    .replace(/<(?!\/?(?:sup|sub)(?:\s|>|\/>))[^>]*>/gi, "")
    .replace(/<\/?(?:sup|sub)\b[^>]*>/gi, (match) => {
      const isClose = match.startsWith("</");
      const tag = /sup|sub/i.exec(match)?.[0]?.toLowerCase() ?? "sup";
      return isClose ? `</${tag}>` : `<${tag}>`;
    });
  return withoutDangerous;
}
