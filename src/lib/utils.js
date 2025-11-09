// src/lib/utils.js
// Minimal utility: join class names with no external deps.

export function cn(...args) {
  // Flattens arrays, filters falsy, joins with spaces
  return args.flat(Infinity).filter(Boolean).join(" ");
}

export default { cn };
