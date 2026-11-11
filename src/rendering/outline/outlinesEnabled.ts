/** Ink outlines are on by default; `?outlines=0` (or `off`/`false`) turns them off. */
export function outlinesEnabled(search: string): boolean {
  const value = new URLSearchParams(search).get('outlines');
  return value === null || !['0', 'off', 'false'].includes(value.toLowerCase());
}
