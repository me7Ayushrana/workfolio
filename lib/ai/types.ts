export type AIProviderId = 'gemini' | 'groq' | 'custom'

export type AITaskKind =
  | 'SIMPLE_TEXT'
  | 'FAST_CLASSIFICATION'
  | 'ACTIVITY_STRUCTURING'
  | 'WEEKLY_REFLECTION'
  | 'DOCUMENT_ANALYSIS'
  | 'IMAGE_ANALYSIS'
  | 'RESEARCH_PAPER_ANALYSIS'
  | 'LONG_CONTEXT_WORK_ANALYSIS'
  | 'PROJECT_CASE_STUDY'
  | 'SKILL_SUGGESTION'
  | 'CAPABILITY_SUGGESTION'
  | 'ASK_WORKFOLIO'

export interface AIProviderConfig {
  id: AIProviderId
  name: string
  enabled: boolean
  apiKey?: string
  model: string
  defaultModel?: string
  supportedModels?: string[]
  status: 'NOT_CONFIGURED' | 'CONNECTED' | 'ERROR' | 'unconfigured' | 'active' | 'error' | 'VALID' | 'INVALID' | 'NOT_TESTED'
  errorMessage?: string
  lastTestedAt?: string
  lastTested?: string
  byok?: boolean
}

export interface AITaskRouteConfig {
  task: AITaskKind
  primaryProvider: AIProviderId
  fallbackProvider?: AIProviderId
  description: string
}

export interface AIUsageMetrics {
  totalCalls?: number
  totalTokens?: number
  geminiCalls?: number
  groqCalls?: number
  lastUsedAt?: string
  requestsToday?: number
  requestsMonth?: number
  geminiRequests?: number
  groqRequests?: number
  lastRequestTime?: string
  errorCount?: number
  lastErrorMessage?: string
  tokenUsageApprox?: number
}

export interface AIFunctionCallRequest {
  name: string
  arguments: Record<string, any>
}

export interface AISourceAttribution {
  id: string
  type: 'activity' | 'project' | 'evidence' | 'github_event' | 'skill' | 'capability'
  title: string
  url?: string
  date?: string
}

export interface AIStructuredActivityDraft {
  work: string
  learning?: string
  struggle?: string
  intention?: string
  type: 'BUILD' | 'LEARN' | 'RESEARCH' | 'DEBUG' | 'DESIGN' | 'TEST' | 'MEETING' | 'SHIP' | 'PLAN' | 'WORK' | 'OTHER'
  projectId?: string
  projectTitle?: string
  skillName?: string
  capabilities: string[]
  evidenceTitle?: string
  tags: string[]
}

export interface AIWeeklyReflectionDraft {
  dateRange: string
  summary: string
  workedOn: string[]
  learned: string[]
  struggledWith: string[]
  unfinishedIntentions: string[]
  suggestedNextSteps: string[]
  sources: AISourceAttribution[]
}

export interface AIProjectCaseStudyDraft {
  projectId: string
  projectTitle: string
  problemStatement: string
  approach: string
  implementationDetails: string[]
  challengesAndBlockers: string[]
  keyLearnings: string[]
  technicalDecisions: string[]
  outcome: string
  suggestedCapabilities: string[]
  sources: AISourceAttribution[]
}

export type AIDraftState = 'DRAFT' | 'APPROVED' | 'REJECTED'

export interface PendingAIDraft<T = any> {
  id: string
  kind?: AITaskKind
  type?: string
  createdAt: string
  state?: AIDraftState
  data?: T
  payload?: any
  rawPrompt?: string
  sources?: AISourceAttribution[]
}
