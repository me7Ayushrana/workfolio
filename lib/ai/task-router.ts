import { AIProviderId, AITaskKind } from './types'

export interface TaskRouteDefinition {
  task: AITaskKind
  primaryProvider: AIProviderId
  fallbackProvider?: AIProviderId
  description: string
}

export const DEFAULT_TASK_ROUTES: Record<AITaskKind, TaskRouteDefinition> = {
  SIMPLE_TEXT: {
    task: 'SIMPLE_TEXT',
    primaryProvider: 'groq',
    fallbackProvider: 'gemini',
    description: 'Short responses and lightweight text generation'
  },
  FAST_CLASSIFICATION: {
    task: 'FAST_CLASSIFICATION',
    primaryProvider: 'groq',
    fallbackProvider: 'gemini',
    description: 'Fast categorization, tags, and activity type detection'
  },
  ACTIVITY_STRUCTURING: {
    task: 'ACTIVITY_STRUCTURING',
    primaryProvider: 'groq',
    fallbackProvider: 'gemini',
    description: 'Converting raw natural activity notes into structured drafts'
  },
  WEEKLY_REFLECTION: {
    task: 'WEEKLY_REFLECTION',
    primaryProvider: 'gemini',
    fallbackProvider: 'groq',
    description: 'Analyzing 7-day work logs and generating editorial reflections'
  },
  PROJECT_CASE_STUDY: {
    task: 'PROJECT_CASE_STUDY',
    primaryProvider: 'gemini',
    fallbackProvider: 'groq',
    description: 'Deep technical decision analysis and project case study generation'
  },
  DOCUMENT_ANALYSIS: {
    task: 'DOCUMENT_ANALYSIS',
    primaryProvider: 'gemini',
    description: 'PDF, architecture doc, and text file evidence analysis'
  },
  IMAGE_ANALYSIS: {
    task: 'IMAGE_ANALYSIS',
    primaryProvider: 'gemini',
    description: 'UI screenshot and design token extraction'
  },
  RESEARCH_PAPER_ANALYSIS: {
    task: 'RESEARCH_PAPER_ANALYSIS',
    primaryProvider: 'gemini',
    description: 'Extracting key technical findings from research papers'
  },
  LONG_CONTEXT_WORK_ANALYSIS: {
    task: 'LONG_CONTEXT_WORK_ANALYSIS',
    primaryProvider: 'gemini',
    description: 'Long-term activity history analysis and career trajectory mapping'
  },
  SKILL_SUGGESTION: {
    task: 'SKILL_SUGGESTION',
    primaryProvider: 'groq',
    fallbackProvider: 'gemini',
    description: 'Suggesting relevant skills based on activity logs'
  },
  CAPABILITY_SUGGESTION: {
    task: 'CAPABILITY_SUGGESTION',
    primaryProvider: 'gemini',
    fallbackProvider: 'groq',
    description: 'Identifying capability signals from project and evidence ledgers'
  },
  ASK_WORKFOLIO: {
    task: 'ASK_WORKFOLIO',
    primaryProvider: 'gemini',
    fallbackProvider: 'groq',
    description: 'Persistent RAG AI assistant grounded in Workfolio data'
  }
}

export class TaskRouter {
  getRoute(task: AITaskKind): TaskRouteDefinition {
    return DEFAULT_TASK_ROUTES[task] || {
      task,
      primaryProvider: 'gemini',
      fallbackProvider: 'groq',
      description: 'Default AI Task Routing'
    }
  }

  shouldFallback(task: AITaskKind, error: any): boolean {
    const route = this.getRoute(task)
    if (!route.fallbackProvider) return false

    // Multimodal image/document tasks cannot fallback to text-only providers
    if (task === 'IMAGE_ANALYSIS' || task === 'DOCUMENT_ANALYSIS') {
      return false
    }

    const errStr = String(error?.message || error).toLowerCase()
    return (
      errStr.includes('quota') ||
      errStr.includes('rate limit') ||
      errStr.includes('unavailable') ||
      errStr.includes('503') ||
      errStr.includes('429')
    )
  }
}
