import { createFileRoute } from '@tanstack/react-router'
import { BudService } from '@/server/bud/BudService'

// Entry point for the USER -> BUD -> ORBIT -> SPARK -> SPECIALIST -> SPARK -> ORBIT
// -> BUD flow. Bud is the only agent this route talks to directly.
export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { studentId, message, history, context } = body as {
            studentId?: string
            message?: string
            history?: string[]
            context?: Record<string, unknown>
          }

          if (!message || typeof message !== 'string') {
            return Response.json({ error: 'Invalid request: "message" is required.' }, { status: 400 })
          }
          if (!studentId || typeof studentId !== 'string') {
            return Response.json({ error: 'Unauthorized: "studentId" is required.' }, { status: 401 })
          }

          const bud = new BudService()
          const result = await bud.respond(studentId, message, history || [], context || {})

          if (result.error) {
            return Response.json({ error: result.error }, { status: 422 })
          }

          return Response.json({ response: result.response })
        } catch (error) {
          return Response.json(
            { error: `Internal Server Error: ${error instanceof Error ? error.message : 'unknown error'}` },
            { status: 500 },
          )
        }
      },
    },
  },
})
