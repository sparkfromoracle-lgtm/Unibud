import { AgentRegistry } from '../registry/AgentRegistry'
import { ScholarService } from '../specialists/ScholarService'
import { OracleService } from '../specialists/OracleService'
import { CoachService } from '../specialists/CoachService'

export interface ExecutionPlan {
  agentIds: string[]
  prompt: string
  context: Record<string, unknown>
}

export interface ExecutionResult {
  results: Record<string, string>
  errors: Record<string, string>
}

type Executor = (prompt: string, context: Record<string, unknown>) => Promise<string>

// Spark is the execution/coordination substrate: it dispatches a plan handed to it
// by Orbit to whichever specialists the registry marks active, and aggregates their
// independent answers. It never decides routing itself and never replaces Orbit.
export class SparkService {
  private registry = new AgentRegistry()
  private executionMap = new Map<string, Executor>()

  constructor() {
    const scholar = new ScholarService()
    const oracle = new OracleService()
    const coach = new CoachService()
    this.executionMap.set('scholar', scholar.answer.bind(scholar))
    this.executionMap.set('oracle', oracle.answer.bind(oracle))
    this.executionMap.set('coach', coach.answer.bind(coach))
  }

  async executePlan(plan: ExecutionPlan): Promise<ExecutionResult> {
    const results: Record<string, string> = {}
    const errors: Record<string, string> = {}

    for (const agentId of plan.agentIds) {
      const agent = this.registry.getActive(agentId)
      if (!agent) {
        errors[agentId] = `Agent "${agentId}" is not active or does not exist.`
        continue
      }

      const executor = this.executionMap.get(agentId)
      if (!executor) {
        errors[agentId] = `No execution contract registered for "${agentId}".`
        continue
      }

      try {
        results[agentId] = await executor(plan.prompt, plan.context)
      } catch (error) {
        errors[agentId] = error instanceof Error ? error.message : 'Unknown execution error.'
      }
    }

    return { results, errors }
  }
}
