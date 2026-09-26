import { GeminiProvider } from './providers/gemini'
import { GroqProvider } from './providers/groq'
import { TaskRouter } from './task-router'
import { PROMPT_TEMPLATES } from './prompt-templates'
import {
  AIProviderId,
  AITaskKind,
  AIStructuredActivityDraft,
  AIWeeklyReflectionDraft,
  AIProjectCaseStudyDraft,
  AISourceAttribution
} from './types'

export class AIService {
  private geminiProvider = new GeminiProvider()
  private groqProvider = new GroqProvider()
  private taskRouter = new TaskRouter()

  private getProvider(id: AIProviderId) {
    if (id === 'groq') return this.groqProvider
    return this.geminiProvider
  }

  async testConnection(providerId: AIProviderId, apiKey: string, model?: string) {
    const provider = this.getProvider(providerId)
    return provider.testConnection(apiKey, model)
  }

  async parseActivity(
    rawText: string,
    projects: { id: string; name: string }[],
    config: { provider?: AIProviderId; apiKey?: string; model?: string } = {}
  ): Promise<AIStructuredActivityDraft> {
    const route = this.taskRouter.getRoute('ACTIVITY_STRUCTURING')
    const providerId = config.provider || route.primaryProvider
    const provider = this.getProvider(providerId)

    const projectsContext = projects.map((p) => `- ${p.name} (ID: ${p.id})`).join('\n') || 'None'
    const prompt = PROMPT_TEMPLATES.ACTIVITY_PARSER_V1
      .replace('{userRawText}', rawText)
      .replace('{projectsContext}', projectsContext)

    try {
      return await provider.generateStructuredOutput<AIStructuredActivityDraft>({
        prompt,
        apiKey: config.apiKey,
        model: config.model,
        jsonMode: true
      })
    } catch (err: any) {
      if (this.taskRouter.shouldFallback('ACTIVITY_STRUCTURING', err) && route.fallbackProvider) {
        const fallback = this.getProvider(route.fallbackProvider)
        return await fallback.generateStructuredOutput<AIStructuredActivityDraft>({
          prompt,
          apiKey: config.apiKey,
          jsonMode: true
        })
      }
      throw err
    }
  }

  async generateWeeklyReflection(
    activities: any[],
    githubEvents: any[],
    config: { provider?: AIProviderId; apiKey?: string; model?: string } = {}
  ): Promise<AIWeeklyReflectionDraft> {
    const route = this.taskRouter.getRoute('WEEKLY_REFLECTION')
    const providerId = config.provider || route.primaryProvider
    const provider = this.getProvider(providerId)

    const activitiesContext = activities
      .map((a) => `- [${a.date}] Work: ${a.work} | Learned: ${a.learning || 'N/A'} | Struggle: ${a.struggle || 'N/A'}`)
      .join('\n') || 'No activities logged this week.'

    const githubContext = githubEvents
      .map((g) => `- [${g.date}] GitHub ${g.type}: ${g.title} (${g.repoName})`)
      .join('\n') || 'No GitHub events synced.'

    const prompt = PROMPT_TEMPLATES.WEEKLY_REFLECTION_V1
      .replace('{recordCount}', activities.length.toString())
      .replace('{activitiesContext}', activitiesContext)
      .replace('{githubContext}', githubContext)

    const sources: AISourceAttribution[] = activities.slice(0, 5).map((a) => ({
      id: a.id,
      type: 'activity',
      title: a.work.slice(0, 45) + '...',
      date: a.date
    }))

    const draft = await provider.generateStructuredOutput<AIWeeklyReflectionDraft>({
      prompt,
      apiKey: config.apiKey,
      model: config.model,
      jsonMode: true
    })

    return { ...draft, sources }
  }

  async generateProjectCaseStudy(
    project: any,
    projectActivities: any[],
    config: { provider?: AIProviderId; apiKey?: string; model?: string } = {}
  ): Promise<AIProjectCaseStudyDraft> {
    const route = this.taskRouter.getRoute('PROJECT_CASE_STUDY')
    const providerId = config.provider || route.primaryProvider
    const provider = this.getProvider(providerId)

    const projectLogsContext = projectActivities
      .map((a) => `- [${a.date}] ${a.work} (Learned: ${a.learning || 'N/A'}, Blocker: ${a.struggle || 'N/A'})`)
      .join('\n') || 'No project-specific logs recorded.'

    const prompt = PROMPT_TEMPLATES.PROJECT_CASE_STUDY_V1
      .replace('{projectName}', project.name)
      .replace('{projectCategory}', project.category || 'General')
      .replace('{projectDescription}', project.description || '')
      .replace('{projectLogsContext}', projectLogsContext)

    const sources: AISourceAttribution[] = projectActivities.slice(0, 5).map((a) => ({
      id: a.id,
      type: 'activity',
      title: a.work,
      date: a.date
    }))

    const draft = await provider.generateStructuredOutput<AIProjectCaseStudyDraft>({
      prompt,
      apiKey: config.apiKey,
      model: config.model,
      jsonMode: true
    })

    return {
      ...draft,
      projectId: project.id,
      projectTitle: project.name,
      sources
    }
  }

  async askWorkfolio(
    userQuestion: string,
    contextData: { activities: any[]; projects: any[]; evidence: any[]; github: any[] },
    config: { provider?: AIProviderId; apiKey?: string; model?: string } = {}
  ): Promise<{ text: string; sources: AISourceAttribution[] }> {
    const route = this.taskRouter.getRoute('ASK_WORKFOLIO')
    const providerId = config.provider || route.primaryProvider
    const provider = this.getProvider(providerId)

    const activitiesSummary = contextData.activities
      .slice(0, 8)
      .map((a) => `• Activity [${a.date}]: ${a.work} (Project: ${a.projectTitle || 'Workspace'})`)
      .join('\n')

    const projectsSummary = contextData.projects
      .slice(0, 5)
      .map((p) => `• Project: ${p.name} (${p.category}) - Status: ${p.status}`)
      .join('\n')

    const evidenceSummary = contextData.evidence
      .slice(0, 5)
      .map((e) => `• Evidence: ${e.title} (Category: ${e.category})`)
      .join('\n')

    const githubSummary = contextData.github
      .slice(0, 5)
      .map((g) => `• GitHub ${g.type}: ${g.title} (${g.repoName})`)
      .join('\n')

    const dataContext = `
ACTIVITIES:
${activitiesSummary || 'None'}

PROJECTS:
${projectsSummary || 'None'}

EVIDENCE:
${evidenceSummary || 'None'}

GITHUB ACTIVITY:
${githubSummary || 'None'}
`

    const prompt = PROMPT_TEMPLATES.ASK_WORKFOLIO_V1
      .replace('{workfolioDataContext}', dataContext)
      .replace('{userQuestion}', userQuestion)

    const sources: AISourceAttribution[] = [
      ...contextData.activities.slice(0, 3).map((a) => ({ id: a.id, type: 'activity' as const, title: a.work, date: a.date })),
      ...contextData.projects.slice(0, 2).map((p) => ({ id: p.id, type: 'project' as const, title: p.name })),
      ...contextData.evidence.slice(0, 2).map((e) => ({ id: e.id, type: 'evidence' as const, title: e.title }))
    ]

    try {
      const responseText = await provider.generateText({
        prompt,
        apiKey: config.apiKey,
        model: config.model
      })
      return { text: responseText, sources }
    } catch (err: any) {
      if (this.taskRouter.shouldFallback('ASK_WORKFOLIO', err) && route.fallbackProvider) {
        const fallback = this.getProvider(route.fallbackProvider)
        const text = await fallback.generateText({ prompt, apiKey: config.apiKey })
        return { text, sources }
      }
      throw err
    }
  }
}

export const aiService = new AIService()
