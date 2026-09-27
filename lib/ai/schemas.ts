export interface AIActivityParseResult {
  type: 'BUILD' | 'LEARN' | 'RESEARCH' | 'DEBUG' | 'DESIGN' | 'TEST' | 'MEETING' | 'SHIP' | 'PLAN' | 'WORK' | 'OTHER'
  work: string
  duration?: string
  learning?: string
  struggle?: string
  nextStep?: string
  projectId?: string | null
  projectTitle?: string | null
  suggestedSkills: string[]
  suggestedEvidence: string[]
  suggestedTags: string[]
}

export interface AIWeeklyReflectionResult {
  summary: string
  workedOn: string[]
  learned: string[]
  problemsEncountered: string[]
  problemsSolved: string[]
  importantProgress: string[]
  unfinishedIntentions: string[]
  projectsMovedForward: string[]
  repeatedFocusAreas: string[]
  suggestedFocusNextWeek: string[]
  supportingRecordIds: string[]
}

export interface AINextActionItem {
  id: string
  title: string
  reason: string
  projectId?: string
  projectName?: string
  relatedGoal?: string
  relatedProblem?: string
  suggestedAction: string
  supportingRecords: Array<{
    id: string
    title: string
    type: 'activity' | 'problem' | 'goal' | 'project' | 'learning'
  }>
}

export interface AINextActionResult {
  suggestions: AINextActionItem[]
}

export interface AskWorkfolioResult {
  answer: string
  verifiedDataPoints: string[]
  aiInterpretation: string[]
  sources: Array<{
    id: string
    type: 'activity' | 'project' | 'evidence' | 'skill' | 'problem' | 'goal'
    title: string
    date?: string
    url?: string
  }>
}

export interface AIProjectSummaryResult {
  whatItIs: string
  problemSolved: string
  whatBuilt: string
  keyTechnicalWork: string[]
  challenges: string[]
  solutions: string[]
  whatWasLearned: string[]
  currentStatus: string
  nextSteps: string[]
  sources?: Array<{
    id: string
    type: 'activity' | 'update' | 'milestone'
    title: string
    date?: string
  }>
}

// Validator functions
export function validateActivityParseResult(data: any): AIActivityParseResult {
  return {
    type: data?.type || 'WORK',
    work: typeof data?.work === 'string' ? data.work : 'Unspecified activity',
    duration: data?.duration || undefined,
    learning: data?.learning || undefined,
    struggle: data?.struggle || undefined,
    nextStep: data?.nextStep || undefined,
    projectId: data?.projectId || null,
    projectTitle: data?.projectTitle || null,
    suggestedSkills: Array.isArray(data?.suggestedSkills) ? data.suggestedSkills : [],
    suggestedEvidence: Array.isArray(data?.suggestedEvidence) ? data.suggestedEvidence : [],
    suggestedTags: Array.isArray(data?.suggestedTags) ? data.suggestedTags : []
  }
}

export function validateWeeklyReflectionResult(data: any): AIWeeklyReflectionResult {
  return {
    summary: data?.summary || 'No reflection summary generated.',
    workedOn: Array.isArray(data?.workedOn) ? data.workedOn : [],
    learned: Array.isArray(data?.learned) ? data.learned : [],
    problemsEncountered: Array.isArray(data?.problemsEncountered) ? data.problemsEncountered : [],
    problemsSolved: Array.isArray(data?.problemsSolved) ? data.problemsSolved : [],
    importantProgress: Array.isArray(data?.importantProgress) ? data.importantProgress : [],
    unfinishedIntentions: Array.isArray(data?.unfinishedIntentions) ? data.unfinishedIntentions : [],
    projectsMovedForward: Array.isArray(data?.projectsMovedForward) ? data.projectsMovedForward : [],
    repeatedFocusAreas: Array.isArray(data?.repeatedFocusAreas) ? data.repeatedFocusAreas : [],
    suggestedFocusNextWeek: Array.isArray(data?.suggestedFocusNextWeek) ? data.suggestedFocusNextWeek : [],
    supportingRecordIds: Array.isArray(data?.supportingRecordIds) ? data.supportingRecordIds : []
  }
}

export function validateNextActionResult(data: any): AINextActionResult {
  const rawSuggestions = Array.isArray(data?.suggestions) ? data.suggestions : []
  const suggestions: AINextActionItem[] = rawSuggestions.map((item: any, idx: number) => ({
    id: item?.id || `next-action-${idx}-${Date.now()}`,
    title: item?.title || 'Focus Action Item',
    reason: item?.reason || 'Based on recent Workfolio activity and open intentions.',
    projectId: item?.projectId || undefined,
    projectName: item?.projectName || undefined,
    relatedGoal: item?.relatedGoal || undefined,
    relatedProblem: item?.relatedProblem || undefined,
    suggestedAction: item?.suggestedAction || 'Review and take action.',
    supportingRecords: Array.isArray(item?.supportingRecords) ? item.supportingRecords : []
  }))
  return { suggestions }
}

export function validateAskWorkfolioResult(data: any): AskWorkfolioResult {
  return {
    answer: typeof data?.answer === 'string' ? data.answer : 'No response generated.',
    verifiedDataPoints: Array.isArray(data?.verifiedDataPoints) ? data.verifiedDataPoints : [],
    aiInterpretation: Array.isArray(data?.aiInterpretation) ? data.aiInterpretation : [],
    sources: Array.isArray(data?.sources) ? data.sources : []
  }
}

export function validateProjectSummaryResult(data: any): AIProjectSummaryResult {
  return {
    whatItIs: data?.whatItIs || 'Project overview not available.',
    problemSolved: data?.problemSolved || 'Core problem not specified.',
    whatBuilt: data?.whatBuilt || 'Key deliverables overview.',
    keyTechnicalWork: Array.isArray(data?.keyTechnicalWork) ? data.keyTechnicalWork : [],
    challenges: Array.isArray(data?.challenges) ? data.challenges : [],
    solutions: Array.isArray(data?.solutions) ? data.solutions : [],
    whatWasLearned: Array.isArray(data?.whatWasLearned) ? data.whatWasLearned : [],
    currentStatus: data?.currentStatus || 'In Progress',
    nextSteps: Array.isArray(data?.nextSteps) ? data.nextSteps : [],
    sources: Array.isArray(data?.sources) ? data.sources : []
  }
}
