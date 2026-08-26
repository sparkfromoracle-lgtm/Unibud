import { createProvider, resolveDefaultProvider } from '../providers/LLMProvider'

// Scholar is independent: it knows nothing about Orbit, Spark, or other specialists.
export class ScholarService {
  private provider = createProvider(resolveDefaultProvider())
  private systemPrompt = 'You are Scholar, an academic specialist. Answer concisely and accurately.'

  async answer(prompt: string, context: Record<string, unknown>): Promise<string> {
    const contextualPrompt = `Student context: ${JSON.stringify(context)}\n\nStudent question: ${prompt}`
    const response = await this.provider.complete(contextualPrompt, this.systemPrompt)
    return response.content
  }
}
