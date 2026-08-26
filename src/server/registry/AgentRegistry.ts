// Registry of every agent in the UNIBUD kernel. Bud, Orbit, and Guardian are the
// always-on control plane; specialists are individually toggled active/frozen so
// Spark's execution map only ever dispatches to agents this registry approves.
export type AgentStatus = 'active' | 'frozen'

export interface Agent {
  id: string
  name: string
  description: string
  role: 'specialist' | 'guardian' | 'orchestrator' | 'product_assistant' | 'substrate'
  systemInstructions: string
  capabilities: string[]
  status: AgentStatus
}

const AGENTS: Agent[] = [
  {
    id: 'bud',
    name: 'Bud',
    description: 'User-facing assistant',
    role: 'product_assistant',
    systemInstructions: 'You are Bud, the friendly AI assistant the student talks to directly.',
    capabilities: ['conversation'],
    status: 'active',
  },
  {
    id: 'orbit',
    name: 'Orbit',
    description: 'Orchestration authority',
    role: 'orchestrator',
    systemInstructions: 'You are Orbit, the orchestrator that routes requests to specialists.',
    capabilities: ['orchestration'],
    status: 'active',
  },
  {
    id: 'guardian',
    name: 'Guardian',
    description: 'Safety and permission layer',
    role: 'guardian',
    systemInstructions: 'You are Guardian, enforcing safety policy on input and output.',
    capabilities: ['safety'],
    status: 'active',
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Academic intelligence',
    role: 'specialist',
    systemInstructions: 'You are Scholar, an academic specialist. Answer concisely and accurately.',
    capabilities: ['academic'],
    status: 'active',
  },
  {
    id: 'oracle',
    name: 'Oracle',
    description: 'Research and verification',
    role: 'specialist',
    systemInstructions: 'You are Oracle, a research and verification specialist. Never fabricate citations.',
    capabilities: ['research'],
    status: 'active',
  },
  {
    id: 'coach',
    name: 'Coach',
    description: 'Productivity and planning',
    role: 'specialist',
    systemInstructions: 'You are Coach, a planning and productivity specialist.',
    capabilities: ['productivity'],
    status: 'active',
  },
  // Remaining specialists are defined but frozen until their execution contracts
  // are implemented in Spark's execution map.
  { id: 'atlas', name: 'Atlas', description: 'Information and navigation', role: 'specialist', systemInstructions: 'You are Atlas.', capabilities: ['retrieval'], status: 'frozen' },
  { id: 'pulse', name: 'Pulse', description: 'Analytics and insights', role: 'specialist', systemInstructions: 'You are Pulse.', capabilities: ['analytics'], status: 'frozen' },
  { id: 'vision', name: 'Vision', description: 'Visual understanding', role: 'specialist', systemInstructions: 'You are Vision.', capabilities: ['visual'], status: 'frozen' },
  { id: 'community', name: 'Community', description: 'Community intelligence', role: 'specialist', systemInstructions: 'You are Community.', capabilities: ['social'], status: 'frozen' },
  { id: 'creator', name: 'Creator', description: 'Content generation', role: 'specialist', systemInstructions: 'You are Creator.', capabilities: ['generation'], status: 'frozen' },
  { id: 'voice', name: 'Voice', description: 'Audio/Speech intelligence', role: 'specialist', systemInstructions: 'You are Voice.', capabilities: ['audio'], status: 'frozen' },
  { id: 'navigator', name: 'Navigator', description: 'Action and navigation', role: 'specialist', systemInstructions: 'You are Navigator.', capabilities: ['action'], status: 'frozen' },
  { id: 'architect', name: 'Architect', description: 'System structuring', role: 'specialist', systemInstructions: 'You are Architect.', capabilities: ['structure'], status: 'frozen' },
  { id: 'artist', name: 'Artist', description: 'Visual design', role: 'specialist', systemInstructions: 'You are Artist.', capabilities: ['design'], status: 'frozen' },
]

export class AgentRegistry {
  private agents = new Map(AGENTS.map((agent) => [agent.id, agent]))

  get(id: string): Agent | undefined {
    return this.agents.get(id)
  }

  getActive(id: string): Agent | undefined {
    const agent = this.agents.get(id)
    return agent?.status === 'active' ? agent : undefined
  }

  getActiveAgents(): Agent[] {
    return Array.from(this.agents.values()).filter((agent) => agent.status === 'active')
  }
}
