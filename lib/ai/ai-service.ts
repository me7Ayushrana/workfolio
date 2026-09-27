import { PROMPTS } from './prompts'
import { GeminiProvider } from './providers/gemini'
import { GroqProvider } from './providers/groq'
import { AIProviderId } from './types'
import {
  AIActivityParseResult,
  AIWeeklyReflectionResult,
  AINextActionResult,
  AskWorkfolioResult,
  AIProjectSummaryResult,
  validateActivityParseResult,
  validateWeeklyReflectionResult,
  validateNextActionResult,
  validateAskWorkfolioResult,
  validateProjectSummaryResult
} from './schemas'
import { WORKFOLIO_TOOLS, WorkfolioContextData } from './tools'
import {
  getEffectiveProviderConfig,
  getProviderPreferences,
  saveBYOKCredential,
  updateProviderStatusInVault,
  AIProviderStatus
} from './credential-vault'

export class AIService {
  private geminiProvider = new GeminiProvider()
  private groqProvider = new GroqProvider()

  /**
   * Universal AI Provider Dispatcher with Deterministic Server-Side Routing & Failover
   */
  private async executeStructuredAI<T>(
    prompt: string,
    options: { apiKey?: string; model?: string } = {},
    systemInstruction?: string
  ): Promise<T> {
    const prefs = getProviderPreferences()
    let primaryId = prefs.primaryProvider
    let secondaryId: 'gemini' | 'groq' = primaryId === 'gemini' ? 'groq' : 'gemini'

    // Check if explicit override is provided in options
    if (options.apiKey?.trim()) {
      const explicitKey = options.apiKey.trim()
      const isGroq = explicitKey.startsWith('gsk_') || (options.model && options.model.includes('llama'))
      if (isGroq) {
        return this.groqProvider.generateStructuredOutput<T>({
          prompt,
          apiKey: explicitKey,
          model: options.model && !options.model.includes('gemini') ? options.model : 'llama-3.3-70b-versatile',
          systemInstruction
        })
      } else {
        return this.geminiProvider.generateStructuredOutput<T>({
          prompt,
          apiKey: explicitKey,
          model: options.model && options.model.includes('gemini') ? options.model : 'gemini-1.5-flash',
          systemInstruction
        })
      }
    }

    // Resolve server effective configs
    const primaryConfig = getEffectiveProviderConfig(primaryId)
    const secondaryConfig = getEffectiveProviderConfig(secondaryId)

    if (!primaryConfig.isConfigured && !secondaryConfig.isConfigured) {
      const error: any = new Error(
        'AI is not configured. Please set GEMINI_API_KEY or GROQ_API_KEY on your server, or connect your key in AI Settings.'
      )
      error.code = 'NOT_CONFIGURED'
      throw error
    }

    // Pick target configuration
    const activeId = primaryConfig.isConfigured ? primaryId : secondaryId
    const activeConfig = primaryConfig.isConfigured ? primaryConfig : secondaryConfig
    const activeProvider = activeId === 'gemini' ? this.geminiProvider : this.groqProvider

    try {
      return await activeProvider.generateStructuredOutput<T>({
        prompt,
        apiKey: activeConfig.apiKey,
        model: options.model || activeConfig.model,
        systemInstruction
      })
    } catch (err: any) {
      // Check if recoverable for fallback
      const isRecoverable =
        err?.code === 'NETWORK_ERROR' || err?.code === 'PROVIDER_ERROR' || (err?.message && err.message.includes('500'))

      if (isRecoverable && prefs.fallbackEnabled && primaryConfig.isConfigured && secondaryConfig.isConfigured) {
        const fallbackProvider = secondaryId === 'gemini' ? this.geminiProvider : this.groqProvider
        return await fallbackProvider.generateStructuredOutput<T>({
          prompt,
          apiKey: secondaryConfig.apiKey,
          model: secondaryConfig.model,
          systemInstruction
        })
      }

      // Re-throw non-recoverable error (INVALID, BILLING_REQUIRED, PERMISSION_ERROR, NOT_CONFIGURED)
      throw err
    }
  }

  /**
   * Connection Verification for Gemini and Groq BYOK & Platform keys
   */
  async testConnection(
    providerId: AIProviderId,
    apiKey: string,
    model?: string
  ): Promise<{ success: boolean; status: AIProviderStatus; message: string }> {
    const cleanKey = apiKey?.trim() || ''

    // If key provided, test submitted key
    if (cleanKey) {
      if (providerId === 'gemini') {
        const result = await this.geminiProvider.testConnection(cleanKey, model)
        if (result.success) {
          saveBYOKCredential('gemini', cleanKey, result.status, model)
        }
        return result
      } else if (providerId === 'groq') {
        const result = await this.groqProvider.testConnection(cleanKey, model)
        if (result.success) {
          saveBYOKCredential('groq', cleanKey, result.status, model)
        }
        return result
      }
    }

    // Otherwise test server effective key
    const effective = getEffectiveProviderConfig(providerId === 'groq' ? 'groq' : 'gemini')
    if (!effective.isConfigured) {
      return {
        success: false,
        status: 'NOT_CONFIGURED',
        message: `${providerId === 'groq' ? 'Groq' : 'Google Gemini'} is not configured on server.`
      }
    }

    let result: { success: boolean; status: AIProviderStatus; message: string }
    if (providerId === 'groq') {
      result = await this.groqProvider.testConnection(effective.apiKey, model || effective.model)
    } else {
      result = await this.geminiProvider.testConnection(effective.apiKey, model || effective.model)
    }

    updateProviderStatusInVault(providerId === 'groq' ? 'groq' : 'gemini', result.status)
    return result
  }

  /**
   * FEATURE 1: AI Activity Parser
   */
  async parseActivity(
    rawText: string,
    projects: { id: string; name: string }[] = [],
    skills: { id: string; name: string }[] = [],
    options: { apiKey?: string; model?: string } = {}
  ): Promise<AIActivityParseResult> {
    const projectsContext =
      projects.length > 0
        ? projects.map((p) => `- Project Name: "${p.name}" (ID: ${p.id})`).join('\n')
        : 'No existing projects found.'

    const skillsContext =
      skills.length > 0 ? skills.map((s) => `- ${s.name}`).join('\n') : 'No custom skills pre-registered.'

    const prompt = PROMPTS.ACTIVITY_PARSER
      .replace('{userRawText}', rawText)
      .replace('{projectsContext}', projectsContext)
      .replace('{skillsContext}', skillsContext)

    const rawResult = await this.executeStructuredAI<any>(prompt, options)
    const validated = validateActivityParseResult(rawResult)

    if (validated.projectTitle && validated.projectTitle !== 'No matching project found' && projects.length > 0) {
      const match = projects.find(
        (p) => p.name.toLowerCase().trim() === validated.projectTitle?.toLowerCase().trim()
      )
      if (match) {
        validated.projectId = match.id
        validated.projectTitle = match.name
      } else {
        const fuzzy = projects.find((p) => rawText.toLowerCase().includes(p.name.toLowerCase()))
        if (fuzzy) {
          validated.projectId = fuzzy.id
          validated.projectTitle = fuzzy.name
        } else {
          validated.projectId = null
          validated.projectTitle = 'No matching project found'
        }
      }
    } else {
      validated.projectId = null
      validated.projectTitle = 'No matching project found'
    }

    return validated
  }

  /**
   * FEATURE 2: AI Voice Logging
   */
  async parseVoiceTranscript(
    transcript: string,
    projects: { id: string; name: string }[] = [],
    skills: { id: string; name: string }[] = [],
    options: { apiKey?: string; model?: string } = {}
  ): Promise<AIActivityParseResult> {
    return this.parseActivity(transcript, projects, skills, options)
  }

  /**
   * FEATURE 3: AI Weekly Reflection
   */
  async generateWeeklyReflection(
    dateRange: string,
    context: WorkfolioContextData,
    options: { apiKey?: string; model?: string } = {}
  ): Promise<AIWeeklyReflectionResult> {
    const activities = context.activities || []
    const projects = context.projects || []
    const problems = context.problems || []
    const learningTracks = context.learningTracks || []

    if (activities.length === 0 && projects.length === 0) {
      return {
        summary: 'Not enough activity has been recorded for a meaningful weekly reflection.',
        workedOn: [],
        learned: [],
        problemsEncountered: [],
        problemsSolved: [],
        importantProgress: [],
        unfinishedIntentions: [],
        projectsMovedForward: [],
        repeatedFocusAreas: [],
        suggestedFocusNextWeek: ['Log your daily activities to start building weekly insights.'],
        supportingRecordIds: []
      }
    }

    const activitiesContext =
      activities
        .map(
          (a) =>
            `- [${a.date || 'Recent'}] Work: ${a.work} | Learned: ${a.learning || 'N/A'} | Struggle: ${a.struggle || 'N/A'}`
        )
        .join('\n') || 'None recorded'

    const projectsContext =
      projects.map((p) => `- Project: ${p.name} (Status: ${p.status || 'Active'})`).join('\n') || 'None'

    const problemsContext =
      problems.map((pr) => `- Problem: ${pr.title} (Status: ${pr.status || 'Open'})`).join('\n') || 'None'

    const learningContext =
      learningTracks.map((l) => `- Learning Track: ${l.title}`).join('\n') || 'None'

    const prompt = PROMPTS.WEEKLY_REFLECTION
      .replace('{dateRange}', dateRange)
      .replace('{recordCount}', activities.length.toString())
      .replace('{activitiesContext}', activitiesContext)
      .replace('{projectsContext}', projectsContext)
      .replace('{problemsContext}', problemsContext)
      .replace('{learningContext}', learningContext)

    const rawResult = await this.executeStructuredAI<any>(prompt, options)
    const validated = validateWeeklyReflectionResult(rawResult)
    validated.supportingRecordIds = activities.map((a) => a.id).slice(0, 10)
    return validated
  }

  /**
   * FEATURE 4: AI Next Action
   */
  async generateNextActions(
    context: WorkfolioContextData,
    options: { apiKey?: string; model?: string } = {}
  ): Promise<AINextActionResult> {
    const activities = context.activities || []
    const projects = context.projects || []
    const problems = context.problems || []
    const goals = context.goals || []

    const intentionsContext =
      activities
        .filter((a) => a.intention || a.struggle)
        .map((a) => `- [${a.date || 'Recent'}] Next Step: "${a.intention || 'N/A'}" | Challenge: "${a.struggle || 'N/A'}"`)
        .join('\n') || 'No explicit next steps logged in recent activities.'

    const projectsContext =
      projects.map((p) => `- Project ID "${p.id}": ${p.name} (Category: ${p.category}, Status: ${p.status})`).join('\n') ||
      'No active projects.'

    const problemsContext =
      problems.filter((pr) => pr.status !== 'SOLVED').map((pr) => `- Unresolved Problem ID "${pr.id}": ${pr.title}`).join('\n') ||
      'No open problems.'

    const goalsContext =
      goals.map((g) => `- Goal ID "${g.id}": ${g.title} (Target Date: ${g.targetDate || 'Ongoing'})`).join('\n') ||
      'No specific goals defined.'

    const prompt = PROMPTS.NEXT_ACTION
      .replace('{intentionsContext}', intentionsContext)
      .replace('{projectsContext}', projectsContext)
      .replace('{problemsContext}', problemsContext)
      .replace('{goalsContext}', goalsContext)

    const rawResult = await this.executeStructuredAI<any>(prompt, options)
    return validateNextActionResult(rawResult)
  }

  /**
   * FEATURE 5: Ask Workfolio
   */
  async askWorkfolio(
    userQuestion: string,
    context: WorkfolioContextData,
    options: { apiKey?: string; model?: string } = {}
  ): Promise<AskWorkfolioResult> {
    const matchedActivities = WORKFOLIO_TOOLS.searchActivities(context, userQuestion)
    const matchedProjects = WORKFOLIO_TOOLS.searchProjects(context, userQuestion)
    const matchedEvidence = WORKFOLIO_TOOLS.searchEvidence(context, userQuestion)
    const matchedProblems = WORKFOLIO_TOOLS.searchProblems(context, userQuestion)

    const databaseContext = `
ACTIVITIES MATCHED (${matchedActivities.length}):
${matchedActivities.slice(0, 6).map((a) => `- [Activity ID ${a.id} on ${a.date}]: Work: "${a.work}" | Project: "${a.projectTitle || 'N/A'}"`).join('\n') || 'No direct activity matches.'}

PROJECTS MATCHED (${matchedProjects.length}):
${matchedProjects.slice(0, 4).map((p) => `- [Project ID ${p.id}]: Name: "${p.name}" | Status: ${p.status} | Tech: ${p.technologies?.join(', ') || 'N/A'}`).join('\n') || 'No direct project matches.'}

EVIDENCE MATCHED (${matchedEvidence.length}):
${matchedEvidence.slice(0, 4).map((e) => `- [Evidence ID ${e.id}]: Title: "${e.title}" | Category: ${e.category}`).join('\n') || 'No direct evidence matches.'}

PROBLEMS MATCHED (${matchedProblems.length}):
${matchedProblems.slice(0, 4).map((pr) => `- [Problem ID ${pr.id}]: Title: "${pr.title}" | Status: ${pr.status}`).join('\n') || 'No direct problem matches.'}
`

    const prompt = PROMPTS.ASK_WORKFOLIO
      .replace('{userQuestion}', userQuestion)
      .replace('{databaseContext}', databaseContext)

    const rawResult = await this.executeStructuredAI<any>(prompt, options)
    const validated = validateAskWorkfolioResult(rawResult)

    const sources: AskWorkfolioResult['sources'] = []
    matchedActivities.slice(0, 3).forEach((a) => {
      sources.push({ id: a.id, type: 'activity', title: a.work, date: a.date })
    })
    matchedProjects.slice(0, 2).forEach((p) => {
      sources.push({ id: p.id, type: 'project', title: p.name })
    })
    matchedEvidence.slice(0, 2).forEach((e) => {
      sources.push({ id: e.id, type: 'evidence', title: e.title })
    })

    return {
      ...validated,
      sources
    }
  }

  /**
   * FEATURE 6: AI Project Summary
   */
  async generateProjectSummary(
    project: any,
    projectActivities: any[] = [],
    milestones: any[] = [],
    options: { apiKey?: string; model?: string } = {}
  ): Promise<AIProjectSummaryResult> {
    const projectLogsContext =
      projectActivities
        .map(
          (a) =>
            `- [${a.date || 'Recent'}] ${a.work} (Learned: ${a.learning || 'None'}, Blocker: ${a.struggle || 'None'})`
        )
        .join('\n') || 'No project-specific logs recorded yet.'

    const milestonesContext =
      milestones.map((m) => `- Milestone: ${m.title} (${m.completed ? 'Completed' : 'Pending'})`).join('\n') ||
      'No explicit milestones recorded.'

    const prompt = PROMPTS.PROJECT_SUMMARY
      .replace('{projectName}', project.name || 'Untitled Project')
      .replace('{projectCategory}', project.category || 'General')
      .replace('{projectStatus}', project.status || 'Active')
      .replace('{projectDescription}', project.description || 'No description provided.')
      .replace('{activityCount}', projectActivities.length.toString())
      .replace('{projectLogsContext}', projectLogsContext)
      .replace('{milestonesContext}', milestonesContext)

    const rawResult = await this.executeStructuredAI<any>(prompt, options)
    const validated = validateProjectSummaryResult(rawResult)
    validated.sources = projectActivities.slice(0, 5).map((a) => ({
      id: a.id,
      type: 'activity',
      title: a.work,
      date: a.date
    }))

    return validated
  }
}

export const aiService = new AIService()
