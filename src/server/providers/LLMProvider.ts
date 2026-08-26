// Provider abstraction over Netlify AI Gateway. SDKs are zero-config: Netlify injects
// provider-specific env vars (ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY) at
// runtime, so no keys are read or forwarded from the client.
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenAI } from '@google/genai'

export type ProviderName = 'anthropic' | 'openai' | 'gemini'

export interface CompleteOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface LLMResponse {
  content: string
}

export interface LLMProvider {
  complete(prompt: string, systemPrompt: string, options?: CompleteOptions): Promise<LLMResponse>
}

class AnthropicProvider implements LLMProvider {
  private client = new Anthropic()
  private defaultModel = 'claude-sonnet-5'

  async complete(prompt: string, systemPrompt: string, options?: CompleteOptions): Promise<LLMResponse> {
    const response = await this.client.messages.create({
      model: options?.model || this.defaultModel,
      max_tokens: options?.maxTokens ?? 1024,
      temperature: options?.temperature ?? 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })
    const block = response.content[0]
    return { content: block && block.type === 'text' ? block.text : '' }
  }
}

class OpenAIProvider implements LLMProvider {
  private client = new OpenAI()
  private defaultModel = 'gpt-4o'

  async complete(prompt: string, systemPrompt: string, options?: CompleteOptions): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    })
    return { content: response.choices[0]?.message?.content || '' }
  }
}

class GeminiProvider implements LLMProvider {
  private client = new GoogleGenAI({})
  private defaultModel = 'gemini-3-flash-preview'

  async complete(prompt: string, systemPrompt: string, options?: CompleteOptions): Promise<LLMResponse> {
    const response = await this.client.models.generateContent({
      model: options?.model || this.defaultModel,
      contents: `${systemPrompt}\n\n${prompt}`,
    })
    return { content: response.text || '' }
  }
}

export function createProvider(name: ProviderName): LLMProvider {
  switch (name) {
    case 'anthropic':
      return new AnthropicProvider()
    case 'openai':
      return new OpenAIProvider()
    case 'gemini':
      return new GeminiProvider()
    default:
      throw new Error(`Provider "${name}" is not supported.`)
  }
}

// Resolves the active provider from whichever AI Gateway credentials are present,
// preferring Anthropic, in line with the fallback order already documented in AGENTS.md.
export function resolveDefaultProvider(): ProviderName {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.GEMINI_API_KEY) return 'gemini'
  return 'anthropic'
}
