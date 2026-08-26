import { GuardianService } from '../guardian/GuardianService'
import { SparkService } from '../spark/SparkService'

export interface OrchestrateResult {
  result: string
  error?: string
}

// Orbit is the routing/orchestration authority. It decides which specialists a
// request needs via capability matching, then hands the plan to Spark to execute.
// It never talks to specialists directly and never freezes/unfreezes agents itself.
export class OrbitService {
  private guardian = new GuardianService()
  private spark = new SparkService()

  private routeToAgents(message: string): string[] {
    const agentIds: string[] = []
    if (/\b(homework|assignment|explain|academic|project|exam|study)\b/i.test(message)) {
      agentIds.push('scholar')
    }
    if (/\b(research|verify|source|citation|fact.?check)\b/i.test(message)) {
      agentIds.push('oracle')
    }
    if (/\b(plan|schedule|goal|priorit|organize|productivity)\b/i.test(message)) {
      agentIds.push('coach')
    }
    if (agentIds.length === 0) {
      agentIds.push('scholar')
    }
    return agentIds
  }

  async orchestrate(
    studentId: string,
    message: string,
    history: string[],
    context: Record<string, unknown>,
  ): Promise<OrchestrateResult> {
    const preCheck = await this.guardian.preCheck(studentId, message)
    if (!preCheck.allowed) {
      return { result: '', error: preCheck.reason || 'Blocked by Guardian.' }
    }

    const agentIds = this.routeToAgents(message)

    const executionResult = await this.spark.executePlan({
      agentIds,
      prompt: message,
      context: { studentId, history, ...context },
    })

    if (Object.keys(executionResult.errors).length > 0) {
      const message = Object.values(executionResult.errors).join('; ')
      return { result: '', error: `Coordination failure: ${message}` }
    }

    const aggregated = Object.values(executionResult.results).join('\n\n').trim()

    const outputCheck = await this.guardian.outputCheck(aggregated)
    if (!outputCheck.safe) {
      return { result: '', error: outputCheck.reason || 'Guardian rejected the generated output.' }
    }

    return { result: aggregated }
  }
}
