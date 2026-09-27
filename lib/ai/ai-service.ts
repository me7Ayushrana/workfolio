import { callGeminiStructured } from './gemini'
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

export class AIService {
  private geminiProvider = new GeminiProvider()
  private groqProvider = new GroqProvider()

  /**
   * Connection Verification for Gemini and Groq BYOK
   */
  async testConnection(
    providerId: AIProviderId,
    apiKey: string,
    model?: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanKey = apiKey?.trim() || ''
    if (providerId === 'gemini') {
      return this.geminiProvider.testConnection(cleanKey, model)
    } else if (providerId === 'groq') {
      return this.groqProvider.testConnection(cleanKey, model)
    }
    return { success: false, message: `Unsupported provider: ${providerId}` }
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

    const rawResult = await callGeminiStructured({
      prompt,
      apiKey: options.apiKey,
      model: options.model
    })

    const validated = validateActivityParseResult(rawResult)

    // Match matched project name to real project object if found
    if (validated.projectTitle && validated.projectTitle !== 'No matching project found' && projects.length > 0) {
      const match = projects.find(
        (p) => p.name.toLowerCase().trim() === validated.projectTitle?.toLowerCase().trim()
      )
      if (match) {
        validated.projectId = match.id
        validated.projectTitle = match.name
      } else {
        // Double check fuzzy match
        const fuzzy = projects.find((p) =>
          rawText.toLowerCase().includes(p.name.toLowerCase())
        )
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
   * FEATURE 2: AI Voice Logging (reuses Activity Parser with transcript)
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
      problems
        .map((pr) => `- Problem: ${pr.title} (Status: ${pr.status || 'Open'})`)
        .join('\n') || 'None'

    const learningContext =
      learningTracks.map((l) => `- Learning Track: ${l.title}`).join('\n') || 'None'

    const prompt = PROMPTS.WEEKLY_REFLECTION
      .replace('{dateRange}', dateRange)
      .replace('{recordCount}', activities.length.toString())
      .replace('{activitiesContext}', activitiesContext)
      .replace('{projectsContext}', projectsContext)
      .replace('{problemsContext}', problemsContext)
      .replace('{learningContext}', learningContext)

    const rawResult = await callGeminiStructured({
      prompt,
      apiKey: options.apiKey,
      model: options.model
    })

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

    const intentionsContext = activities
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

    const rawResult = await callGeminiStructured({
      prompt,
      apiKey: options.apiKey,
      model: options.model
    })

    return validateNextActionResult(rawResult)
  }

  /**
   * FEATURE 5: Ask Workfolio (Controlled Tool-Calling Query)
   */
  async askWorkfolio(
    userQuestion: string,
    context: WorkfolioContextData,
    options: { apiKey?: string; model?: string } = {}
  ): Promise<AskWorkfolioResult> {
    // 1. Perform controlled tool queries over Workfolio data
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

    const rawResult = await callGeminiStructured({
      prompt,
      apiKey: options.apiKey,
      model: options.model
    })

    const validated = validateAskWorkfolioResult(rawResult)

    // Build verified source list from matched records
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

    const rawResult = await callGeminiStructured({
      prompt,
      apiKey: options.apiKey,
      model: options.model
    })

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
