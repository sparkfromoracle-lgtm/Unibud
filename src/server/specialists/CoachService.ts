import { createProvider, resolveDefaultProvider } from '../providers/LLMProvider'

// Coach is independent: it knows nothing about Orbit, Spark, or other specialists.
export class CoachService {
  private provider = createProvider(resolveDefaultProvider())
  private systemPrompt = 'You are Coach, a planning and productivity specialist.'

  async answer(prompt: string, context: Record<string, unknown>): Promise<string> {
    const contextualPrompt = `User context: ${JSON.stringify(context)}\n\nUser question: ${prompt}`
    const response = await this.provider.complete(contextualPrompt, this.systemPrompt)
    return response.content
  }
}
