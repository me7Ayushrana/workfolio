'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  AIProviderConfig,
  AIProviderId,
  AITaskKind,
  AIUsageMetrics,
  PendingAIDraft,
  AISourceAttribution
} from './ai/types'
import { subscribeAuthState } from './firebase'

export interface GitHubRepoItem {
  id: string
  name: string
  fullName: string
  description: string
  language: string
  stars: number
  forks: number
  url: string
  updatedAt: string
}

export interface GitHubObservedActivity {
  id: string
  type: 'COMMIT' | 'PULL_REQUEST' | 'ISSUE' | 'RELEASE'
  title: string
  repoName: string
  repoUrl: string
  date: string
  details?: string
}

export type ResourceType =
  | 'PROJECT'
  | 'TEMPLATE'
  | 'UI KIT'
  | 'COMPONENT'
  | 'STARTER'
  | 'TOOL'
  | 'AI WORKFLOW'
  | 'RESEARCH'
  | 'GUIDE'
  | 'API'
  | 'AUTOMATION'
  | 'RESOURCE'

export type ResourceCategory =
  | 'AI & Machine Learning'
  | 'Frontend Systems'
  | 'Developer Tools'
  | 'Automation'
  | 'Research'
  | 'Design Systems'

export interface ExploreResource {
  id: string
  slug: string
  title: string
  description: string
  longDescription: string
  coverImage: string
  screenshots: string[]
  type: ResourceType
  category: ResourceCategory
  tags: string[]
  technologies: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  version: string
  createdBy: string
  publishedDate: string
  updatedDate: string
  featured: boolean
  status: 'published' | 'draft' | 'scheduled' | 'archived'
  scheduledDate?: string
  viewsCount: number
  savesCount: number
  implementationsCount: number
  externalUrl?: string
  repositoryUrl?: string
  documentationUrl?: string
  implementationGuide: string[]
  learnPoints: string[]
  reusePoints: string[]
  requirements: string[]
  changelog?: { version: string; date: string; notes: string }[]
  collectionId?: string
  sourceProjectId?: string
}

export interface ExploreCollection {
  id: string
  slug: string
  title: string
  description: string
  coverImage: string
  resourceCount: number
  featured: boolean
}

export interface ProjectItem {
  id: string
  name: string
  description: string
  status: 'Active' | 'In progress' | 'Completed' | 'Paused' | 'Planning' | 'Archived'
  category: string
  accent: string
  date: string
  repositoryUrl?: string
  liveUrl?: string
  documentationUrl?: string
  figmaUrl?: string
  explorePublished?: boolean
  exploreResourceId?: string
  notes?: string
  milestones?: { date: string; title: string; completed: boolean }[]
}

export interface ImplementationRecord {
  id: string
  resourceId: string
  resourceTitle: string
  resourceVersion: string
  projectId: string
  projectTitle: string
  implementedAt: string
  status: 'PLANNED' | 'IN PROGRESS' | 'IMPLEMENTED' | 'ARCHIVED'
  notes?: string
}

export interface ResourceRequest {
  id: string
  title: string
  description: string
  category: string
  requestedAt: string
  status: 'Pending' | 'In Review' | 'Approved' | 'Built'
}

export interface ResourceFeedback {
  resourceId: string
  useful: boolean
  improvement?: string
  submittedAt: string
}

// -------------------------------------------------------------
// CORE PERSONAL WORKSPACE DATA TYPES (DAILY LOG, LEARNING, GOALS, SKILLS)
// -------------------------------------------------------------

export type ActivityType =
  | 'BUILD'
  | 'LEARN'
  | 'RESEARCH'
  | 'DEBUG'
  | 'DESIGN'
  | 'TEST'
  | 'MEETING'
  | 'SHIP'
  | 'PLAN'
  | 'WORK'
  | 'OTHER'

export interface ActivityLogEntry {
  id: string
  date: string // YYYY-MM-DD
  time: string
  work: string // What did you work on?
  learning?: string // What did you learn?
  struggle?: string // What did you struggle with?
  intention?: string // What will you work on next?
  projectId?: string
  projectTitle?: string
  skillId?: string
  skillName?: string
  capabilities: string[]
  evidenceTitle?: string
  evidenceUrl?: string
  type: ActivityType
  durationMinutes?: number
}

export type SkillStatus =
  | 'PLANNED'
  | 'LEARNING'
  | 'PRACTICING'
  | 'APPLIED'
  | 'STRONG'
  | 'PAUSED'
  | 'ARCHIVED'

export interface SkillItem {
  id: string
  name: string
  category: string
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Learning'
  learningGoal: string
  description?: string
  targetDate?: string
  status: SkillStatus
  currentlyLearning: string
  nextStep?: string
  startedDate: string
  lastUpdatedDate: string
  relatedCapability?: string
  relatedProjectId?: string
}

export interface LearningStep {
  id: string
  title: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
}

export interface LearningTrack {
  id: string
  topic: string
  progress: number // 0-100
  steps: LearningStep[]
  nextSteps: string[]
}

export interface GoalItem {
  id: string
  title: string
  deadline: string
  projectId?: string
  skillId?: string
  type: 'Daily' | 'Weekly' | 'Monthly' | 'Learning' | 'Project'
  completed: boolean
  totalSteps: number
  completedSteps: number
}

export interface ProblemSolution {
  id: string
  problem: string
  attempts: string
  solution?: string
  projectId?: string
  capability?: string
  resolved: boolean
  date: string
}

export type MascotVariant = 'male' | 'female'

export interface MascotCustomization {
  variant: MascotVariant
  hairStyle: 'short' | 'afro' | 'bob' | 'fade' | 'knot' | 'waves' | 'buzz' | 'sleek'
  hairColor: string
  facialHair: 'none' | 'beard' | 'stubble' | 'mustache' | 'goatee'
  eyewear: 'gold_round' | 'black_frames' | 'cyber_visor' | 'aviators' | 'none'
  eyeStyle: 'sparkle' | 'focused' | 'wink' | 'shades'
  browStyle: 'thick' | 'sleek' | 'bold'
  outfit: 'navy_suit' | 'emerald_vest' | 'crimson_hoodie' | 'cyber_tech' | 'white_shirt' | 'gold_blazer'
  accessories: 'none' | 'headphones' | 'earrings' | 'beanie' | 'lapel_pin'
}

export const DEFAULT_MASCOT_CUSTOMIZATION: MascotCustomization = {
  variant: 'male',
  hairStyle: 'short',
  hairColor: '#2b1b17',
  facialHair: 'none',
  eyewear: 'gold_round',
  eyeStyle: 'sparkle',
  browStyle: 'thick',
  outfit: 'navy_suit',
  accessories: 'none'
}

export interface UserProfile {
  id: string
  auth_user_id: string
  first_name: string
  last_name: string
  display_name: string
  username: string
  email: string
  avatar_url: string
  mascot_variant: MascotVariant
  mascot_customization?: MascotCustomization
  bio?: string
  headline?: string
  location?: string
  website?: string
  github_username?: string
  github_connected?: boolean
  google_connected?: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: '',
  auth_user_id: '',
  first_name: '',
  last_name: '',
  display_name: '',
  username: '',
  email: '',
  avatar_url: '',
  mascot_variant: 'male',
  headline: '',
  bio: '',
  github_username: '',
  github_connected: false,
  google_connected: false,
  onboarding_completed: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// -------------------------------------------------------------
// INITIAL SEED DATA FOR LOGGED WORK, LEARNING & SKILLS (EMPTY BY DEFAULT)
// -------------------------------------------------------------

const INITIAL_SKILLS: SkillItem[] = []
const INITIAL_ACTIVITIES: ActivityLogEntry[] = []
const INITIAL_LEARNING: LearningTrack[] = []
const INITIAL_GOALS: GoalItem[] = []
const INITIAL_PROBLEMS: ProblemSolution[] = []

const INITIAL_RESOURCES: ExploreResource[] = [
  {
    id: 'res-[#1]',
    slug: 'analytics-ui-system',
    title: 'Editorial Analytics UI System',
    description: 'A restrained, typography-first interface system for data-dense dashboards.',
    longDescription:
      'Designed for complex data applications that require poise and legibility. Built with warm ivory tones, deep forest accents, and accessible charts.',
    coverImage: '/images/mono-2.png',
    screenshots: ['/images/mono-2.png'],
    type: 'UI KIT',
    category: 'Design Systems',
    tags: ['UI Kit', 'Components', 'Design', 'Tailwind'],
    technologies: ['React 19', 'Tailwind CSS', 'Framer Motion'],
    difficulty: 'Beginner',
    version: '2.1.0',
    createdBy: 'Workfolio Core Team',
    publishedDate: '2026-09-10',
    updatedDate: '2026-09-22',
    featured: true,
    status: 'published',
    viewsCount: 2890,
    savesCount: 712,
    implementationsCount: 310,
    externalUrl: 'https://analytics-ui.workfolio.app',
    repositoryUrl: 'https://github.com/workfolio/analytics-ui-kit',
    documentationUrl: 'https://docs.workfolio.app/analytics-ui',
    implementationGuide: [
      'Import design tokens into tailwind.config or CSS variables.',
      'Mount card and chart components in your UI library.'
    ],
    learnPoints: ['Designing editorial dashboard hierarchy without cluttered borders'],
    reusePoints: ['Customizable metric card variants'],
    requirements: ['React 18+', 'Tailwind CSS'],
    collectionId: 'col-frontend-systems'
  }
]

const INITIAL_COLLECTIONS: ExploreCollection[] = [
  {
    id: 'col-ai-ml',
    slug: 'ai-machine-learning',
    title: 'AI & Intelligence Systems',
    description: 'OCR, voice parsing, automated categorization and intelligent agent workflows.',
    coverImage: '/images/mono-1.png',
    resourceCount: 4,
    featured: true
  },
  {
    id: 'col-frontend-systems',
    slug: 'frontend-systems',
    title: 'Editorial Frontend Systems',
    description: 'Clean UI kits, graph visualization components, and modern Next.js templates.',
    coverImage: '/images/mono-2.png',
    resourceCount: 6,
    featured: true
  }
]

const INITIAL_PROJECTS: ProjectItem[] = []
const INITIAL_IMPLEMENTATIONS: ImplementationRecord[] = []

interface WorkfolioStoreContextType {
  userProfile: UserProfile
  updateUserProfile: (updates: Partial<UserProfile>) => void
  setMascotVariant: (variant: MascotVariant) => void
  mascotCustomization: MascotCustomization
  updateMascotCustomization: (updates: Partial<MascotCustomization>) => void
  connectProvider: (provider: 'google' | 'github', identityData?: Partial<UserProfile>) => void
  disconnectProvider: (provider: 'google' | 'github') => void
  completeOnboarding: (data: Partial<UserProfile>) => void

  activities: ActivityLogEntry[]
  skills: SkillItem[]
  learningTracks: LearningTrack[]
  goals: GoalItem[]
  problems: ProblemSolution[]
  resources: ExploreResource[]
  collections: ExploreCollection[]
  projects: ProjectItem[]
  implementations: ImplementationRecord[]
  savedResourceIds: string[]
  recentlyViewedIds: string[]
  requests: ResourceRequest[]
  feedbackList: ResourceFeedback[]
  evidence: any[]
  createProblem: (problem: string, attempts?: string, solution?: string) => ProblemSolution
  updateExploreResource: (id: string, updates: Partial<ExploreResource>) => void

  // Activity Actions
  logActivityEntry: (entry: Omit<ActivityLogEntry, 'id' | 'date' | 'time'>) => ActivityLogEntry
  updateActivityEntry: (activityId: string, updates: Partial<ActivityLogEntry>) => void
  updateActivityProject: (activityId: string, projectId: string | undefined) => void
  updateActivitySkill: (activityId: string, skillId: string | undefined) => void
  deleteActivity: (activityId: string) => void

  // Skill Actions
  createSkill: (skillData: Omit<SkillItem, 'id' | 'startedDate' | 'lastUpdatedDate'>) => SkillItem
  updateSkill: (id: string, updates: Partial<SkillItem>) => void
  archiveSkill: (id: string) => void
  restoreSkill: (id: string) => void
  deleteSkill: (id: string, option: 'keep_history' | 'delete_all') => void
  addSkillLearningUpdate: (
    skillId: string,
    updateData: {
      work: string
      learning?: string
      struggle?: string
      intention?: string
      projectId?: string
      evidenceTitle?: string
      evidenceUrl?: string
    }
  ) => ActivityLogEntry

  // Project Actions
  createProject: (
    name: string,
    description: string,
    category: string,
    status?: ProjectItem['status'],
    repositoryUrl?: string,
    liveUrl?: string,
    documentationUrl?: string
  ) => ProjectItem
  updateProject: (id: string, updates: Partial<ProjectItem>) => void
  updateProjectNotes: (projectId: string, notes: string) => void
  addProjectMilestone: (projectId: string, title: string) => void
  toggleProjectMilestone: (projectId: string, milestoneIndex: number) => void
  duplicateProject: (projectId: string) => ProjectItem
  archiveProject: (projectId: string) => void
  restoreProject: (projectId: string) => void
  deleteProject: (projectId: string, option: 'keep_associated' | 'delete_all') => void

  // Learning / Goal Actions
  toggleGoal: (goalId: string) => void
  addGoal: (goal: Omit<GoalItem, 'id' | 'completed' | 'completedSteps'>) => void
  toggleLearningStep: (trackId: string, stepId: string) => void
  resolveProblem: (problemId: string, solutionText: string) => void

  // Explore / Admin Actions
  saveResource: (id: string) => void
  unsaveResource: (id: string) => void
  isSaved: (id: string) => boolean
  recordView: (id: string) => void
  implementResource: (resourceId: string, projectId: string, notes?: string) => ImplementationRecord
  createProjectAndImplement: (resourceId: string, projectName: string, projectCategory: string) => ImplementationRecord
  publishProjectToExplore: (projectId: string, metadata: Partial<ExploreResource>) => ExploreResource
  createNewExploreResource: (resource: Omit<ExploreResource, 'id' | 'slug' | 'viewsCount' | 'savesCount' | 'implementationsCount'>) => ExploreResource
  submitResourceRequest: (title: string, description: string, category: string) => void
  submitResourceFeedback: (resourceId: string, useful: boolean, improvement?: string) => void

  // AI Provider & BYOK State
  geminiConfig: AIProviderConfig
  groqConfig: AIProviderConfig
  aiPrimaryProvider: AIProviderId
  aiFallbackEnabled: boolean
  byokEnabled: boolean
  aiUsageMetrics: AIUsageMetrics
  pendingDrafts: PendingAIDraft[]

  // GitHub Integration State
  githubConnected: boolean
  githubUsername: string
  githubAvatar?: string
  githubRepos: GitHubRepoItem[]
  observedActivities: GitHubObservedActivity[]

  // AI & GitHub Integration Actions
  updateAIProviderConfig: (providerId: AIProviderId, updates: Partial<AIProviderConfig>) => void
  updateBYOKMode: (enabled: boolean) => void
  setAIPrimaryProvider: (providerId: AIProviderId) => void
  testAIProviderConnection: (providerId: AIProviderId, apiKey: string, model?: string) => Promise<{ success: boolean; message: string }>
  executeAITask: (task: AITaskKind, payload: any) => Promise<any>
  approveDraft: (draftId: string) => void
  rejectDraft: (draftId: string) => void
  addPendingDraft: (draft: Omit<PendingAIDraft, 'id' | 'createdAt' | 'state'>) => PendingAIDraft
  syncGitHubData: (username?: string, token?: string) => Promise<{ success: boolean; message: string }>
  linkGitHubRepoToProject: (projectId: string, repoUrl: string) => void
}

const WorkfolioContext = createContext<WorkfolioStoreContextType | null>(null)

export function WorkfolioProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE)
  const [activities, setActivities] = useState<ActivityLogEntry[]>(INITIAL_ACTIVITIES)
  const [skills, setSkills] = useState<SkillItem[]>(INITIAL_SKILLS)
  const [learningTracks, setLearningTracks] = useState<LearningTrack[]>(INITIAL_LEARNING)
  const [goals, setGoals] = useState<GoalItem[]>(INITIAL_GOALS)
  const [problems, setProblems] = useState<ProblemSolution[]>(INITIAL_PROBLEMS)
  const [resources, setResources] = useState<ExploreResource[]>(INITIAL_RESOURCES)
  const [collections, setCollections] = useState<ExploreCollection[]>(INITIAL_COLLECTIONS)
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS)
  const [implementations, setImplementations] = useState<ImplementationRecord[]>(INITIAL_IMPLEMENTATIONS)
  const [savedResourceIds, setSavedResourceIds] = useState<string[]>(['res-analytics-ui-kit'])
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([])
  const [requests, setRequests] = useState<ResourceRequest[]>([])
  const [feedbackList, setFeedbackList] = useState<ResourceFeedback[]>([])

  // AI Provider & BYOK State
  const [geminiConfig, setGeminiConfig] = useState<AIProviderConfig>({
    id: 'gemini',
    name: 'Google Gemini',
    enabled: true,
    apiKey: '',
    model: 'gemini-2.0-flash',
    defaultModel: 'gemini-2.0-flash',
    supportedModels: ['gemini-2.0-flash', 'gemini-1.5-pro'],
    status: 'NOT_CONFIGURED',
    byok: true
  })

  const [groqConfig, setGroqConfig] = useState<AIProviderConfig>({
    id: 'groq',
    name: 'Groq',
    enabled: true,
    apiKey: '',
    model: 'llama-3.3-70b-versatile',
    defaultModel: 'llama-3.3-70b-versatile',
    supportedModels: ['llama-3.3-70b-versatile', 'llama3-8b-8192'],
    status: 'NOT_CONFIGURED',
    byok: true
  })

  const [aiPrimaryProvider, setAiPrimaryProviderState] = useState<AIProviderId>('gemini')
  const [aiFallbackEnabled, setAiFallbackEnabled] = useState<boolean>(true)
  const [byokEnabled, setByokEnabled] = useState<boolean>(true)
  const [aiUsageMetrics, setAiUsageMetrics] = useState<AIUsageMetrics>({
    totalCalls: 14,
    totalTokens: 18240,
    geminiCalls: 10,
    groqCalls: 4,
    lastUsedAt: new Date().toISOString()
  })

  const [pendingDrafts, setPendingDrafts] = useState<PendingAIDraft[]>([])

  // GitHub Integration State
  const [githubConnected, setGithubConnected] = useState<boolean>(false)
  const [githubUsername, setGithubUsername] = useState<string>('')
  const [githubAvatar, setGithubAvatar] = useState<string>('')
  const [githubRepos, setGithubRepos] = useState<GitHubRepoItem[]>([])
  const [observedActivities, setObservedActivities] = useState<GitHubObservedActivity[]>([])

  // Load state from localStorage on client mount
  useEffect(() => {
    try {
      // Auto-purge legacy demo data from localStorage on first mount after clean build
      const isClean = localStorage.getItem('workfolio_clean_state_v3')
      if (!isClean) {
        localStorage.removeItem('workfolio_projects')
        localStorage.removeItem('workfolio_activities')
        localStorage.removeItem('workfolio_skills')
        localStorage.removeItem('workfolio_learning')
        localStorage.removeItem('workfolio_goals')
        localStorage.removeItem('workfolio_problems')
        localStorage.removeItem('workfolio_implementations')
        localStorage.setItem('workfolio_clean_state_v3', 'true')
        setProjects([])
        setActivities([])
        setSkills([])
        setLearningTracks([])
        setGoals([])
        setProblems([])
        setImplementations([])
        return
      }

      const storedProfile = localStorage.getItem('workfolio_user_profile')
      if (storedProfile) setUserProfile(JSON.parse(storedProfile))
      const storedAct = localStorage.getItem('workfolio_activities')
      if (storedAct) setActivities(JSON.parse(storedAct))

      const storedSkills = localStorage.getItem('workfolio_skills')
      if (storedSkills) setSkills(JSON.parse(storedSkills))

      const storedLearn = localStorage.getItem('workfolio_learning')
      if (storedLearn) setLearningTracks(JSON.parse(storedLearn))

      const storedGoals = localStorage.getItem('workfolio_goals')
      if (storedGoals) setGoals(JSON.parse(storedGoals))

      const storedProbs = localStorage.getItem('workfolio_problems')
      if (storedProbs) setProblems(JSON.parse(storedProbs))

      const storedRes = localStorage.getItem('workfolio_resources')
      if (storedRes) setResources(JSON.parse(storedRes))

      const storedProjects = localStorage.getItem('workfolio_projects')
      if (storedProjects) setProjects(JSON.parse(storedProjects))

      const storedImp = localStorage.getItem('workfolio_implementations')
      if (storedImp) setImplementations(JSON.parse(storedImp))

      const storedSaved = localStorage.getItem('workfolio_saved')
      if (storedSaved) setSavedResourceIds(JSON.parse(storedSaved))

      const storedRecent = localStorage.getItem('workfolio_recent')
      if (storedRecent) setRecentlyViewedIds(JSON.parse(storedRecent))

      const storedGemini = localStorage.getItem('workfolio_gemini_config')
      if (storedGemini) {
        try {
          const parsed = JSON.parse(storedGemini)
          if (!parsed.apiKey || !parsed.apiKey.trim()) {
            parsed.apiKey = ''
            parsed.status = 'unconfigured'
          }
          setGeminiConfig(parsed)
        } catch {}
      }

      const storedGroq = localStorage.getItem('workfolio_groq_config')
      if (storedGroq) {
        try {
          const parsed = JSON.parse(storedGroq)
          if (!parsed.apiKey || !parsed.apiKey.trim()) {
            parsed.apiKey = ''
            parsed.status = 'unconfigured'
          }
          setGroqConfig(parsed)
        } catch {}
      }

      const storedDrafts = localStorage.getItem('workfolio_pending_drafts')
      if (storedDrafts) setPendingDrafts(JSON.parse(storedDrafts))
    } catch {
      // Fallback
    }

    const unsubscribe = subscribeAuthState((firebaseUser) => {
      if (firebaseUser) {
        const nameParts = (firebaseUser.displayName || 'Google User').split(' ')
        const updatedProfile = {
          auth_user_id: firebaseUser.uid,
          google_connected: true,
          email: firebaseUser.email || '',
          display_name: firebaseUser.displayName || 'Google User',
          first_name: nameParts[0] || 'User',
          last_name: nameParts.slice(1).join(' ') || '',
          photoURL: firebaseUser.photoURL || ''
        }
        setUserProfile((prev) => ({
          ...prev,
          ...updatedProfile
        }))
        // Automatically sync profile and identity to Supabase PostgreSQL using Firebase UID
        import('./supabase-db').then(({ syncUserDataToSupabase }) => {
          syncUserDataToSupabase(firebaseUser.uid, {
            userProfile: updatedProfile
          })
        })
      } else {
        setUserProfile((prev) => ({
          ...prev,
          google_connected: false,
          auth_user_id: '',
          email: prev.google_connected ? '' : prev.email
        }))
      }
    })
    return () => unsubscribe()
  }, [])

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('workfolio_activities', JSON.stringify(activities))
      localStorage.setItem('workfolio_skills', JSON.stringify(skills))
      localStorage.setItem('workfolio_learning', JSON.stringify(learningTracks))
      localStorage.setItem('workfolio_goals', JSON.stringify(goals))
      localStorage.setItem('workfolio_problems', JSON.stringify(problems))
      localStorage.setItem('workfolio_resources', JSON.stringify(resources))
      localStorage.setItem('workfolio_projects', JSON.stringify(projects))
      localStorage.setItem('workfolio_implementations', JSON.stringify(implementations))
      localStorage.setItem('workfolio_saved', JSON.stringify(savedResourceIds))
      localStorage.setItem('workfolio_recent', JSON.stringify(recentlyViewedIds))
      localStorage.setItem('workfolio_gemini_config', JSON.stringify(geminiConfig))
      localStorage.setItem('workfolio_groq_config', JSON.stringify(groqConfig))
      localStorage.setItem('workfolio_pending_drafts', JSON.stringify(pendingDrafts))
    } catch {
      // Ignore
    }
  }, [activities, skills, learningTracks, goals, problems, resources, projects, implementations, savedResourceIds, recentlyViewedIds, geminiConfig, groqConfig, pendingDrafts])

  // -------------------------------------------------------------
  // ACTIVITY ACTIONS
  // -------------------------------------------------------------
  const logActivityEntry = (entryData: Omit<ActivityLogEntry, 'id' | 'date' | 'time'>) => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    let projTitle = entryData.projectTitle
    if (entryData.projectId && !projTitle) {
      const p = projects.find((proj) => proj.id === entryData.projectId)
      projTitle = p?.name
    }

    let sName = entryData.skillName
    if (entryData.skillId && !sName) {
      const s = skills.find((sk) => sk.id === entryData.skillId)
      sName = s?.name
    }

    const newEntry: ActivityLogEntry = {
      ...entryData,
      id: `act-${Date.now()}`,
      date: todayStr,
      time: timeStr,
      projectTitle: projTitle,
      skillName: sName
    }

    setActivities((prev) => [newEntry, ...prev])

    // If struggle documented, add to problems
    if (entryData.struggle && entryData.struggle.trim()) {
      const newProb: ProblemSolution = {
        id: `prob-${Date.now()}`,
        problem: entryData.struggle.trim(),
        attempts: 'Logged during daily activity session.',
        solution: entryData.intention || undefined,
        projectId: entryData.projectId,
        capability: entryData.capabilities[0] || 'General',
        resolved: false,
        date: todayStr
      }
      setProblems((prev) => [newProb, ...prev])
    }

    // Touch associated project date
    if (entryData.projectId) {
      setProjects((prev) =>
        prev.map((p) => (p.id === entryData.projectId ? { ...p, date: todayStr } : p))
      )
    }

    // Touch associated skill updated date
    if (entryData.skillId) {
      setSkills((prev) =>
        prev.map((sk) => (sk.id === entryData.skillId ? { ...sk, lastUpdatedDate: todayStr } : sk))
      )
    }

    return newEntry
  }

  const updateActivityEntry = (activityId: string, updates: Partial<ActivityLogEntry>) => {
    let projTitle = updates.projectTitle
    if (updates.projectId) {
      const p = projects.find((proj) => proj.id === updates.projectId)
      if (p) projTitle = p.name
    }

    let sName = updates.skillName
    if (updates.skillId) {
      const s = skills.find((sk) => sk.id === updates.skillId)
      if (s) sName = s.name
    }

    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === activityId) {
          return {
            ...a,
            ...updates,
            projectTitle: updates.projectId !== undefined ? (updates.projectId ? projTitle : undefined) : a.projectTitle,
            skillName: updates.skillId !== undefined ? (updates.skillId ? sName : undefined) : a.skillName,
          }
        }
        return a
      })
    )
  }

  const updateActivityProject = (activityId: string, projectId: string | undefined) => {
    const targetProject = projectId ? projects.find((p) => p.id === projectId) : undefined
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? {
              ...a,
              projectId: projectId || undefined,
              projectTitle: targetProject ? targetProject.name : undefined
            }
          : a
      )
    )
  }

  const updateActivitySkill = (activityId: string, skillId: string | undefined) => {
    const targetSkill = skillId ? skills.find((s) => s.id === skillId) : undefined
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? {
              ...a,
              skillId: skillId || undefined,
              skillName: targetSkill ? targetSkill.name : undefined
            }
          : a
      )
    )
  }

  const deleteActivity = (activityId: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== activityId))
  }

  // -------------------------------------------------------------
  // SKILL ACTIONS
  // -------------------------------------------------------------
  const createSkill = (
    skillData: Omit<SkillItem, 'id' | 'startedDate' | 'lastUpdatedDate'>
  ): SkillItem => {
    const today = new Date().toISOString().split('T')[0]
    const newSkill: SkillItem = {
      ...skillData,
      id: `skill-${Date.now()}`,
      startedDate: today,
      lastUpdatedDate: today
    }
    setSkills((prev) => [newSkill, ...prev])
    return newSkill
  }

  const updateSkill = (id: string, updates: Partial<SkillItem>) => {
    const today = new Date().toISOString().split('T')[0]
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, lastUpdatedDate: today } : s))
    )
  }

  const archiveSkill = (id: string) => {
    updateSkill(id, { status: 'ARCHIVED' })
  }

  const restoreSkill = (id: string) => {
    updateSkill(id, { status: 'LEARNING' })
  }

  const deleteSkill = (id: string, option: 'keep_history' | 'delete_all') => {
    if (option === 'keep_history') {
      setActivities((prev) =>
        prev.map((a) => (a.skillId === id ? { ...a, skillId: undefined, skillName: undefined } : a))
      )
    } else {
      setActivities((prev) => prev.filter((a) => a.skillId !== id))
    }
    setSkills((prev) => prev.filter((s) => s.id !== id))
  }

  const addSkillLearningUpdate = (
    skillId: string,
    updateData: {
      work: string
      learning?: string
      struggle?: string
      intention?: string
      projectId?: string
      evidenceTitle?: string
      evidenceUrl?: string
    }
  ): ActivityLogEntry => {
    const skill = skills.find((s) => s.id === skillId)
    return logActivityEntry({
      work: updateData.work,
      learning: updateData.learning,
      struggle: updateData.struggle,
      intention: updateData.intention,
      projectId: updateData.projectId,
      skillId,
      skillName: skill?.name,
      capabilities: [skill?.category || 'Learning'],
      evidenceTitle: updateData.evidenceTitle,
      evidenceUrl: updateData.evidenceUrl,
      type: 'LEARN'
    })
  }

  // -------------------------------------------------------------
  // PROJECT ACTIONS
  // -------------------------------------------------------------
  const createProject = (
    name: string,
    description: string,
    category: string,
    status: ProjectItem['status'] = 'Planning',
    repositoryUrl?: string,
    liveUrl?: string,
    documentationUrl?: string
  ): ProjectItem => {
    const accents = ['bg-[#9b7b3b]', 'bg-[#c1a05b]', 'bg-[#7c2634]', 'bg-[#d8c8ad]']
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name,
      description,
      category,
      status,
      accent: accents[Math.floor(Math.random() * accents.length)],
      date: new Date().toISOString().split('T')[0],
      repositoryUrl,
      liveUrl,
      documentationUrl,
      milestones: [{ date: new Date().toISOString().split('T')[0], title: 'Project created', completed: true }]
    }

    setProjects((prev) => [newProj, ...prev])
    return newProj
  }

  const updateProject = (id: string, updates: Partial<ProjectItem>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const updateProjectNotes = (projectId: string, notes: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, notes } : p)))
  }

  const addProjectMilestone = (projectId: string, title: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const milestones = p.milestones || []
          return {
            ...p,
            milestones: [...milestones, { date: new Date().toISOString().split('T')[0], title, completed: false }]
          }
        }
        return p
      })
    )
  }

  const toggleProjectMilestone = (projectId: string, milestoneIndex: number) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId && p.milestones) {
          const updated = [...p.milestones]
          if (updated[milestoneIndex]) {
            updated[milestoneIndex] = {
              ...updated[milestoneIndex],
              completed: !updated[milestoneIndex].completed
            }
          }
          return { ...p, milestones: updated }
        }
        return p
      })
    )
  }

  const duplicateProject = (projectId: string) => {
    const orig = projects.find((p) => p.id === projectId)
    if (!orig) throw new Error('Project not found')
    const dupe = createProject(`${orig.name} (Copy)`, orig.description, orig.category, 'Planning')
    return dupe
  }

  const archiveProject = (projectId: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: 'Archived' } : p)))
  }

  const restoreProject = (projectId: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: 'In progress' } : p)))
  }

  const deleteProject = (projectId: string, option: 'keep_associated' | 'delete_all') => {
    if (option === 'keep_associated') {
      setActivities((prev) =>
        prev.map((a) => (a.projectId === projectId ? { ...a, projectId: undefined, projectTitle: undefined } : a))
      )
    } else {
      setActivities((prev) => prev.filter((a) => a.projectId !== projectId))
    }
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }

  // -------------------------------------------------------------
  // OTHER ACTIONS (GOALS, EXPLORE, ETC.)
  // -------------------------------------------------------------
  const toggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, completed: !g.completed } : g))
    )
  }

  const addGoal = (goalData: Omit<GoalItem, 'id' | 'completed' | 'completedSteps'>) => {
    const newG: GoalItem = {
      ...goalData,
      id: `goal-${Date.now()}`,
      completed: false,
      completedSteps: 0
    }
    setGoals((prev) => [newG, ...prev])
  }

  const toggleLearningStep = (trackId: string, stepId: string) => {
    setLearningTracks((prev) =>
      prev.map((track) => {
        if (track.id === trackId) {
          const updatedSteps = track.steps.map((s) => {
            if (s.id === stepId) {
              const nextStatus =
                s.status === 'NOT_STARTED'
                  ? 'IN_PROGRESS'
                  : s.status === 'IN_PROGRESS'
                  ? 'COMPLETED'
                  : 'NOT_STARTED'
              return { ...s, status: nextStatus as any }
            }
            return s
          })
          const completedCount = updatedSteps.filter((s) => s.status === 'COMPLETED').length
          const calcProgress = Math.round((completedCount / updatedSteps.length) * 100)
          return { ...track, steps: updatedSteps, progress: calcProgress }
        }
        return track
      })
    )
  }

  const resolveProblem = (problemId: string, solutionText: string) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === problemId ? { ...p, solution: solutionText, resolved: true } : p))
    )
  }

  const saveResource = (id: string) => {
    if (!savedResourceIds.includes(id)) {
      setSavedResourceIds((prev) => [...prev, id])
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, savesCount: r.savesCount + 1 } : r))
      )
    }
  }

  const unsaveResource = (id: string) => {
    setSavedResourceIds((prev) => prev.filter((item) => item !== id))
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, savesCount: Math.max(0, r.savesCount - 1) } : r))
    )
  }

  const isSaved = (id: string) => savedResourceIds.includes(id)

  const recordView = (id: string) => {
    setRecentlyViewedIds((prev) => [id, ...prev.filter((i) => i !== id)].slice(0, 8))
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, viewsCount: r.viewsCount + 1 } : r))
    )
  }

  const implementResource = (resourceId: string, projectId: string, notes?: string) => {
    const resource = resources.find((r) => r.id === resourceId)
    const project = projects.find((p) => p.id === projectId)

    const newImp: ImplementationRecord = {
      id: `imp-${Date.now()}`,
      resourceId,
      resourceTitle: resource?.title || 'Explore Resource',
      resourceVersion: resource?.version || '1.0.0',
      projectId,
      projectTitle: project?.name || 'Project',
      implementedAt: new Date().toISOString().split('T')[0],
      status: 'IMPLEMENTED',
      notes
    }

    setImplementations((prev) => [newImp, ...prev])
    setResources((prev) =>
      prev.map((r) =>
        r.id === resourceId ? { ...r, implementationsCount: r.implementationsCount + 1 } : r
      )
    )

    return newImp
  }

  const createProjectAndImplement = (
    resourceId: string,
    projectName: string,
    projectCategory: string
  ) => {
    const newProj = createProject(projectName, 'Project built using Explore resource.', projectCategory, 'In progress')
    return implementResource(resourceId, newProj.id)
  }

  const createProblem = (problemText: string, attempts?: string, solution?: string): ProblemSolution => {
    const newProb: ProblemSolution = {
      id: `prob-${Date.now()}`,
      problem: problemText,
      attempts: attempts || 'Reported from GitHub issue sync',
      solution: solution,
      resolved: Boolean(solution),
      date: new Date().toISOString().split('T')[0]
    }
    setProblems((prev) => [newProb, ...prev])
    return newProb
  }

  const publishProjectToExplore = (projectId: string, metadata: Partial<ExploreResource>) => {
    const project = projects.find((p) => p.id === projectId)
    const slug = (metadata.title || project?.name || 'project').toLowerCase().replaceAll(' ', '-').replaceAll(/[^a-z0-9-]/g, '')

    const newResource: ExploreResource = {
      id: `res-${Date.now()}`,
      slug,
      title: metadata.title || project?.name || 'Published Resource',
      description: metadata.description || project?.description || 'A published project from Workfolio.',
      longDescription: metadata.longDescription || metadata.description || project?.description || '',
      coverImage: metadata.coverImage || '/images/mono-1.png',
      screenshots: metadata.screenshots || ['/images/mono-1.png'],
      type: metadata.type || 'PROJECT',
      category: (metadata.category as ResourceCategory) || 'Frontend Systems',
      tags: metadata.tags || [project?.category || 'Project'],
      technologies: metadata.technologies || ['React', 'TypeScript'],
      difficulty: metadata.difficulty || 'Intermediate',
      version: metadata.version || '1.0.0',
      createdBy: metadata.createdBy || 'Alex Rivera (Admin)',
      publishedDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      featured: metadata.featured ?? false,
      status: metadata.status || 'published',
      viewsCount: 1,
      savesCount: 0,
      implementationsCount: 0,
      externalUrl: metadata.externalUrl,
      repositoryUrl: metadata.repositoryUrl,
      documentationUrl: metadata.documentationUrl,
      implementationGuide: metadata.implementationGuide || [
        'Review architecture and dependencies.',
        'Import source modules into your application.',
        'Configure environment settings and test.'
      ],
      learnPoints: metadata.learnPoints || ['Core implementation patterns and architecture.'],
      reusePoints: metadata.reusePoints || ['Modular source code and design tokens.'],
      requirements: metadata.requirements || ['React 18+', 'Tailwind CSS'],
      sourceProjectId: projectId
    }

    setResources((prev) => [newResource, ...prev])
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, explorePublished: true, exploreResourceId: newResource.id } : p))
    )

    return newResource
  }

  const createNewExploreResource = (
    resourceData: Omit<ExploreResource, 'id' | 'slug' | 'viewsCount' | 'savesCount' | 'implementationsCount'>
  ) => {
    const slug = resourceData.title.toLowerCase().replaceAll(' ', '-').replaceAll(/[^a-z0-9-]/g, '')
    const newResource: ExploreResource = {
      ...resourceData,
      id: `res-${Date.now()}`,
      slug,
      viewsCount: 0,
      savesCount: 0,
      implementationsCount: 0
    }

    setResources((prev) => [newResource, ...prev])
    return newResource
  }

  const updateExploreResource = (id: string, updates: Partial<ExploreResource>) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedDate: new Date().toISOString().split('T')[0] } : r))
    )
  }

  const submitResourceRequest = (title: string, description: string, category: string) => {
    const newReq: ResourceRequest = {
      id: `req-${Date.now()}`,
      title,
      description,
      category,
      requestedAt: new Date().toISOString().split('T')[0],
      status: 'Pending'
    }
    setRequests((prev) => [newReq, ...prev])
  }

  const submitResourceFeedback = (resourceId: string, useful: boolean, improvement?: string) => {
    const newFb: ResourceFeedback = {
      resourceId,
      useful,
      improvement,
      submittedAt: new Date().toISOString().split('T')[0]
    }
    setFeedbackList((prev) => [newFb, ...prev])
  }

  // User Profile & Authentication Actions
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...updates,
      updated_at: new Date().toISOString().split('T')[0]
    }))
  }

  const mascotCustomization: MascotCustomization =
    userProfile.mascot_customization || { ...DEFAULT_MASCOT_CUSTOMIZATION, variant: userProfile.mascot_variant || 'male' }

  const updateMascotCustomization = (updates: Partial<MascotCustomization>) => {
    setUserProfile((prev) => {
      const current = prev.mascot_customization || { ...DEFAULT_MASCOT_CUSTOMIZATION, variant: prev.mascot_variant || 'male' }
      const updatedCustom = { ...current, ...updates }
      return {
        ...prev,
        mascot_variant: updates.variant || prev.mascot_variant || 'male',
        mascot_customization: updatedCustom,
        updated_at: new Date().toISOString().split('T')[0]
      }
    })
  }

  const setMascotVariant = (variant: MascotVariant) => {
    updateMascotCustomization({ variant })
  }

  const connectProvider = (provider: 'google' | 'github', identityData?: Partial<UserProfile>) => {
    if (provider === 'google') {
      updateUserProfile({
        google_connected: true,
        ...identityData
      })
    } else {
      updateUserProfile({
        github_connected: true,
        github_username: identityData?.github_username || userProfile.github_username || 'connected-user',
        ...identityData
      })
    }
  }

  const disconnectProvider = (provider: 'google' | 'github') => {
    if (provider === 'google') {
      updateUserProfile({ google_connected: false })
    } else {
      updateUserProfile({ github_connected: false })
    }
  }

  const completeOnboarding = (data: Partial<UserProfile>) => {
    updateUserProfile({
      ...data,
      onboarding_completed: true
    })
  }

  // AI & GitHub Actions Implementation
  const updateAIProviderConfig = (providerId: AIProviderId, updates: Partial<AIProviderConfig>) => {
    if (providerId === 'gemini') {
      setGeminiConfig((prev) => {
        const next = { ...prev, ...updates }
        if (!next.apiKey || !next.apiKey.trim()) {
          next.apiKey = ''
          next.status = 'NOT_CONFIGURED'
        }
        return next
      })
    } else {
      setGroqConfig((prev) => {
        const next = { ...prev, ...updates }
        if (!next.apiKey || !next.apiKey.trim()) {
          next.apiKey = ''
          next.status = 'NOT_CONFIGURED'
        }
        return next
      })
    }
  }

  const updateBYOKMode = (enabled: boolean) => {
    setByokEnabled(enabled)
  }

  const setAIPrimaryProvider = (providerId: AIProviderId) => {
    setAiPrimaryProviderState(providerId)
  }

  const testAIProviderConnection = async (providerId: AIProviderId, apiKey: string, model?: string) => {
    try {
      const res = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, apiKey, model })
      })
      const data = await res.json()
      if (data.success) {
        updateAIProviderConfig(providerId, { status: 'CONNECTED', lastTestedAt: new Date().toISOString(), apiKey })
      } else {
        updateAIProviderConfig(providerId, { status: 'ERROR', errorMessage: data.message })
      }
      return data
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection test failed.' }
    }
  }

  const executeAITask = async (task: AITaskKind, payload: any) => {
    try {
      const res = await fetch('/api/ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          payload,
          context: {
            userProfile,
            recentActivities: activities.slice(0, 10),
            projects: projects.slice(0, 5),
            skills: skills.slice(0, 5)
          },
          config: {
            geminiApiKey: geminiConfig.apiKey,
            groqApiKey: groqConfig.apiKey,
            primaryProvider: aiPrimaryProvider,
            fallbackEnabled: aiFallbackEnabled
          }
        })
      })
      const data = await res.json()
      if (data.success) {
        setAiUsageMetrics((prev) => ({
          ...prev,
          totalCalls: (prev.totalCalls || 0) + 1,
          totalTokens: (prev.totalTokens || 0) + (data.tokensUsed || 350),
          geminiCalls: data.providerUsed === 'gemini' ? (prev.geminiCalls || 0) + 1 : (prev.geminiCalls || 0),
          groqCalls: data.providerUsed === 'groq' ? (prev.groqCalls || 0) + 1 : (prev.groqCalls || 0),
          lastUsedAt: new Date().toISOString()
        }))
        return data.result
      } else {
        throw new Error(data.error || 'AI Task execution failed.')
      }
    } catch (err: any) {
      console.error('Execute AI Task error:', err)
      throw err
    }
  }

  const addPendingDraft = (draft: Omit<PendingAIDraft, 'id' | 'createdAt' | 'state'>) => {
    const newDraft: PendingAIDraft = {
      ...draft,
      id: `draft-${Date.now()}`,
      state: 'DRAFT',
      createdAt: new Date().toISOString()
    }
    setPendingDrafts((prev) => [newDraft, ...prev])
    return newDraft
  }

  const approveDraft = (draftId: string) => {
    const draft = pendingDrafts.find((d) => d.id === draftId)
    if (!draft) return

    if (draft.type === 'ACTIVITY_PARSING') {
      const p = draft.payload
      logActivityEntry({
        work: p.work || draft.rawPrompt,
        learning: p.learning || '',
        struggle: p.struggle || '',
        intention: p.intention || '',
        projectId: p.projectId,
        projectTitle: p.projectTitle,
        skillId: p.skillId,
        skillName: p.skillName,
        capabilities: p.capabilities || ['General'],
        evidenceTitle: p.evidenceTitle,
        evidenceUrl: p.evidenceUrl,
        type: p.type || 'WORK',
        durationMinutes: p.durationMinutes || 45
      })
    }
    setPendingDrafts((prev) => prev.filter((d) => d.id !== draftId))
  }

  const rejectDraft = (draftId: string) => {
    setPendingDrafts((prev) => prev.filter((d) => d.id !== draftId))
  }

  const syncGitHubData = async (username?: string, token?: string) => {
    const targetUsername = username || githubUsername || 'me7Ayushrana'
    try {
      const res = await fetch(`/api/github/sync?username=${encodeURIComponent(targetUsername)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await res.json()
      if (data.success) {
        setGithubConnected(true)
        setGithubUsername(targetUsername)
        if (data.user?.avatar_url) setGithubAvatar(data.user.avatar_url)
        if (data.repos) setGithubRepos(data.repos)
        if (data.activities) setObservedActivities(data.activities)
        return { success: true, message: `Synced ${data.repos?.length || 0} repositories and ${data.activities?.length || 0} engineering activities.` }
      } else {
        return { success: false, message: data.message || 'GitHub sync failed.' }
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'GitHub sync error.' }
    }
  }

  const linkGitHubRepoToProject = (projectId: string, repoUrl: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, repositoryUrl: repoUrl } : p)))
  }

  return (
    <WorkfolioContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        setMascotVariant,
        mascotCustomization,
        updateMascotCustomization,
        connectProvider,
        disconnectProvider,
        completeOnboarding,

        activities,
        skills,
        learningTracks,
        goals,
        problems,
        evidence: [],
        createProblem,
        resources,
        collections,
        projects,
        implementations,
        savedResourceIds,
        recentlyViewedIds,
        requests,
        feedbackList,

        logActivityEntry,
        updateActivityEntry,
        updateActivityProject,
        updateActivitySkill,
        deleteActivity,

        createSkill,
        updateSkill,
        archiveSkill,
        restoreSkill,
        deleteSkill,
        addSkillLearningUpdate,

        createProject,
        updateProject,
        updateProjectNotes,
        addProjectMilestone,
        toggleProjectMilestone,
        duplicateProject,
        archiveProject,
        restoreProject,
        deleteProject,

        toggleGoal,
        addGoal,
        toggleLearningStep,
        resolveProblem,

        saveResource,
        unsaveResource,
        isSaved,
        recordView,
        implementResource,
        createProjectAndImplement,
        publishProjectToExplore,
        createNewExploreResource,
        updateExploreResource,
        submitResourceRequest,
        submitResourceFeedback,

        geminiConfig,
        groqConfig,
        aiPrimaryProvider,
        aiFallbackEnabled,
        byokEnabled,
        aiUsageMetrics,
        pendingDrafts,

        githubConnected,
        githubUsername,
        githubAvatar,
        githubRepos,
        observedActivities,

        updateAIProviderConfig,
        updateBYOKMode,
        setAIPrimaryProvider,
        testAIProviderConnection,
        executeAITask,
        approveDraft,
        rejectDraft,
        addPendingDraft,
        syncGitHubData,
        linkGitHubRepoToProject
      }}
    >
      {children}
    </WorkfolioContext.Provider>
  )
}

export function useWorkfolio() {
  const context = useContext(WorkfolioContext)
  if (!context) {
    throw new Error('useWorkfolio must be used within a WorkfolioProvider')
  }
  return context
}
