/**
 * Attempts to repair truncated or malformed JSON from AI responses.
 * Handles the most common case: output cut off mid-string or mid-object.
 */
export function repairJson(raw: string): string {
  // Strip markdown fences
  let s = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

  // Already valid — return as-is
  try { JSON.parse(s); return s } catch {}

  // ── Strategy 1: find the last complete top-level key-value pair ──────────
  // Walk backwards from the end, closing any open structures
  const stack: string[] = []
  let inString = false
  let escape = false
  let lastSafePos = 0

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]

    if (escape) { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }

    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue

    if (ch === '{' || ch === '[') {
      stack.push(ch)
    } else if (ch === '}' || ch === ']') {
      stack.pop()
      // If stack is back to just the root object, this is a safe position
      if (stack.length === 1) lastSafePos = i
    }
  }

  // ── Strategy 2: close all open brackets/braces ───────────────────────────
  // Truncate to last safe position + close everything
  let truncated = lastSafePos > 0 ? s.slice(0, lastSafePos + 1) : s

  // Remove trailing comma before closing
  truncated = truncated.replace(/,\s*$/, '')

  // Close any open string (if we're mid-string, close it)
  let inStr2 = false
  let esc2 = false
  for (const ch of truncated) {
    if (esc2) { esc2 = false; continue }
    if (ch === '\\' && inStr2) { esc2 = true; continue }
    if (ch === '"') inStr2 = !inStr2
  }
  if (inStr2) truncated += '"'

  // Re-count open brackets after truncation
  const stack2: string[] = []
  let inStr3 = false
  let esc3 = false
  for (const ch of truncated) {
    if (esc3) { esc3 = false; continue }
    if (ch === '\\' && inStr3) { esc3 = true; continue }
    if (ch === '"') { inStr3 = !inStr3; continue }
    if (inStr3) continue
    if (ch === '{' || ch === '[') stack2.push(ch)
    else if (ch === '}' || ch === ']') stack2.pop()
  }

  // Close in reverse order
  const closing = stack2.reverse().map((c) => (c === '{' ? '}' : ']')).join('')
  const repaired = truncated + closing

  try {
    JSON.parse(repaired)
    console.log(`[repairJson] Repaired successfully (${raw.length} → ${repaired.length} chars)`)
    return repaired
  } catch {
    // Last resort: return empty object so Zod can at least validate
    console.error('[repairJson] Could not repair JSON, returning {}')
    return '{}'
  }
}
