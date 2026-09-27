export interface WorkfolioContextData {
  activities?: any[]
  projects?: any[]
  evidence?: any[]
  skills?: any[]
  learningTracks?: any[]
  goals?: any[]
  problems?: any[]
  capabilities?: any[]
}

export const WORKFOLIO_TOOLS = {
  searchActivities: (context: WorkfolioContextData, query: string) => {
    const list = context.activities || []
    const q = query.toLowerCase()
    return list.filter(
      (a) =>
        a.work?.toLowerCase().includes(q) ||
        a.learning?.toLowerCase().includes(q) ||
        a.struggle?.toLowerCase().includes(q) ||
        a.projectTitle?.toLowerCase().includes(q) ||
        a.skillName?.toLowerCase().includes(q)
    )
  },

  getActivity: (context: WorkfolioContextData, id: string) => {
    return (context.activities || []).find((a) => a.id === id) || null
  },

  searchProjects: (context: WorkfolioContextData, query: string) => {
    const list = context.projects || []
    const q = query.toLowerCase()
    return list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.technologies?.some((t: string) => t.toLowerCase().includes(q))
    )
  },

  getProject: (context: WorkfolioContextData, id: string) => {
    return (context.projects || []).find((p) => p.id === id || p.name?.toLowerCase() === id.toLowerCase()) || null
  },

  searchEvidence: (context: WorkfolioContextData, query: string) => {
    const list = context.evidence || []
    const q = query.toLowerCase()
    return list.filter(
      (e) => e.title?.toLowerCase().includes(q) || e.summary?.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q)
    )
  },

  getEvidence: (context: WorkfolioContextData, id: string) => {
    return (context.evidence || []).find((e) => e.id === id) || null
  },

  searchSkills: (context: WorkfolioContextData, query: string) => {
    const list = context.skills || []
    const q = query.toLowerCase()
    return list.filter((s) => s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q))
  },

  getLearningSessions: (context: WorkfolioContextData, query?: string) => {
    const list = context.learningTracks || []
    if (!query) return list
    const q = query.toLowerCase()
    return list.filter((l) => l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q))
  },

  searchGoals: (context: WorkfolioContextData, query: string) => {
    const list = context.goals || []
    const q = query.toLowerCase()
    return list.filter((g) => g.title?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q))
  },

  searchProblems: (context: WorkfolioContextData, query: string) => {
    const list = context.problems || []
    const q = query.toLowerCase()
    return list.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.problemDescription?.toLowerCase().includes(q) ||
        p.solutionDescription?.toLowerCase().includes(q)
    )
  },

  getCapabilities: (context: WorkfolioContextData, query?: string) => {
    const list = context.capabilities || ['Python', 'React', 'OCR', 'Automation', 'Problem Solving', 'Deployment']
    if (!query) return list
    const q = query.toLowerCase()
    return list.filter((c: any) => (typeof c === 'string' ? c.toLowerCase().includes(q) : c.name?.toLowerCase().includes(q)))
  }
}
