import DOMPurify from "dompurify";

/**
 * Linkify URLs in plain text and sanitize the result so it's safe
 * to render with dangerouslySetInnerHTML. Prevents stored XSS even
 * if a privileged account is compromised.
 */
export function linkifyAndSanitize(text: string, linkClass = "text-primary underline break-all"): string {
  const linked = text.replace(
    /(https?:\/\/[^\s<]+)/g,
    `<a href="$1" target="_blank" rel="noopener noreferrer" class="${linkClass}">$1</a>`
  );
  return DOMPurify.sanitize(linked, {
    ALLOWED_TAGS: ["a", "br", "b", "i", "em", "strong", "p", "span"],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });
}