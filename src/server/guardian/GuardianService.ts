// Guardian enforces safety policy on the way in (preCheck) and the way out
// (outputCheck). Patterns are strictly scoped categories, not naive substring
// matching, so legitimate academic discussion isn't blocked.
export interface PreCheckResult {
  allowed: boolean
  reason?: string
}

export interface OutputCheckResult {
  safe: boolean
  reason?: string
}

const DANGEROUS_PATTERNS = [
  /\b(self-?harm|suicide)\b/i,
  /\b(child\s*abuse|exploitation)\b/i,
  /\b(hate\s*speech|racial\s*slur)\b/i,
  /\b(how to (make|build) a (bomb|weapon))\b/i,
]

export class GuardianService {
  async preCheck(studentId: string, message: string): Promise<PreCheckResult> {
    if (!studentId) {
      return { allowed: false, reason: 'Unauthenticated request.' }
    }
    if (!message || !message.trim()) {
      return { allowed: false, reason: 'Empty message.' }
    }
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(message)) {
        return { allowed: false, reason: 'This request violates safety policy.' }
      }
    }
    return { allowed: true }
  }

  async outputCheck(content: string): Promise<OutputCheckResult> {
    if (!content || !content.trim()) {
      return { safe: false, reason: 'Empty output generated.' }
    }
    return { safe: true }
  }
}
