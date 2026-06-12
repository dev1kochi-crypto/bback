export function safeBreakHtml(value: string): string {
  const normalized = value.replace(/&lt;\s*br\s*\/?\s*&gt;/gi, '<br>');

  return normalized
    .split(/<\s*br\s*\/?\s*>/gi)
    .map(escapeHtml)
    .join('<br />');
}

export function plainBreakText(value: string): string {
  return value
    .replace(/&lt;\s*br\s*\/?\s*&gt;/gi, ' ')
    .replace(/<\s*br\s*\/?\s*>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
