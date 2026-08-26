import { useCallback, useState } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// A simple student identity for this single-user demo. In a production deployment
// this would come from the authenticated session.
const STUDENT_ID = 'demo-student'

export function useBudChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content }
      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: STUDENT_ID,
            message: content,
            history: [...messages, userMessage].map((m) => `${m.role}: ${m.content}`),
          }),
        })

        const data = await response.json()

        if (!response.ok || data.error) {
          setError(data.error || 'Something went wrong.')
          return
        }

        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: data.response },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error.')
      } finally {
        setIsLoading(false)
      }
    },
    [messages],
  )

  return { messages, sendMessage, isLoading, error }
}
