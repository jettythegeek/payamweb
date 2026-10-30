export function csvCell(value: unknown, options: { phone?: boolean } = {}): string {
  let text = value == null ? '' : Array.isArray(value) ? value.join(',') : String(value);
  if (!options.phone && /^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function csvRow(values: Array<{ value: unknown; phone?: boolean }>): string {
  return `${values.map(({ value, phone }) => csvCell(value, { phone })).join(',')}\r\n`;
}
