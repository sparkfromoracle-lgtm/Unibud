import { OrbitService } from '../orbit/OrbitService'
import { createProvider, resolveDefaultProvider } from '../providers/LLMProvider'

export interface BudResponse {
  response?: string
  error?: string
}

// Bud is the only user-facing agent. It never calls specialists directly - it
// delegates entirely to Orbit, then formats Orbit's aggregated answer for the
// student in its own voice.
export class BudService {
  private orbit = new OrbitService()
  private formatProvider = createProvider(resolveDefaultProvider())
  private systemPrompt = "You are Bud, the student's friendly AI assistant."

  async respond(
    studentId: string,
    message: string,
    history: string[],
    context: Record<string, unknown> = {},
  ): Promise<BudResponse> {
    try {
      const orbitResponse = await this.orbit.orchestrate(studentId, message, history, context)
      if (orbitResponse.error) {
        return { error: orbitResponse.error }
      }

      const formattingPrompt = `Format the following answer for the student in a clear, encouraging way:\n\n${orbitResponse.result}`
      const finalAnswer = await this.formatProvider.complete(formattingPrompt, this.systemPrompt)
      return { response: finalAnswer.content }
    } catch (error) {
      return { error: `Internal system error: ${error instanceof Error ? error.message : 'unknown error'}` }
    }
  }
}
