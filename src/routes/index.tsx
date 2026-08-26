import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Send } from 'lucide-react'
import { Streamdown } from 'streamdown'

import { useBudChat } from '@/lib/ai-hook'
import type { ChatMessage } from '@/lib/ai-hook'

function Messages({ messages }: { messages: ChatMessage[] }) {
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  if (!messages.length) {
    return null
  }

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto pb-4 min-h-0">
      <div className="max-w-3xl mx-auto w-full px-4">
        {messages.map((message) => (
          <div key={message.id} className="p-4 border-b">
            <div className="flex items-start gap-4 max-w-3xl mx-auto w-full">
              <div className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-medium flex-shrink-0">
                {message.role === 'assistant' ? 'B' : 'Y'}
              </div>
              <div className="flex-1 min-w-0 prose max-w-none prose-sm">
                <Streamdown>{message.content}</Streamdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Home() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, isLoading, error } = useBudChat()

  return (
    <div className="relative flex h-[calc(100vh-80px)]">
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-3xl mx-auto w-full">
              <h1 className="text-4xl font-bold mb-4">Bud</h1>
              <p className="mb-6">
                Ask about homework, research, or planning — Bud routes your question through Orbit to the right
                specialist.
              </p>
            </div>
          </div>
        )}
        <Messages messages={messages} />

        <div className="sticky bottom-0 left-0 right-0 border-t z-10">
          <div className="max-w-3xl mx-auto w-full px-4 py-3">
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (input.trim() && !isLoading) {
                  sendMessage(input)
                  setInput('')
                }
              }}
            >
              <div className="relative max-w-xl mx-auto flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Bud something..."
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 border rounded-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: Home,
})
