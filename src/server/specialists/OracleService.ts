import { createProvider, resolveDefaultProvider } from '../providers/LLMProvider'

// Oracle is independent: it knows nothing about Orbit, Spark, or other specialists.
export class OracleService {
  private provider = createProvider(resolveDefaultProvider())
  private systemPrompt =
    'You are Oracle, a research and verification specialist. Provide verifiable sources. Do not fabricate citations.'

  async answer(prompt: string, context: Record<string, unknown>): Promise<string> {
    if (!process.env.WEB_SEARCH_API_KEY) {
      return 'I am Oracle, but I cannot perform external web research because no search tool is configured in this environment. I can only reason from the context provided.'
    }
    const contextualPrompt = `User context: ${JSON.stringify(context)}\n\nUser prompt: ${prompt}`
    const response = await this.provider.complete(contextualPrompt, this.systemPrompt)
    return response.content
  }
}
