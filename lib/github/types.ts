export type GitHubSyncStatus =
  | 'NOT_CONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'SYNCING'
  | 'SYNC_COMPLETE'
  | 'ERROR'

export interface GitHubRepoItem {
  id: string
  name: string
  fullName: string
  description: string
  language: string
  languages?: Record<string, number>
  stars: number
  forks: number
  openIssues: number
  url: string
  htmlUrl: string
  defaultBranch: string
  visibility: 'public' | 'private' | 'internal'
  topics: string[]
  createdDate: string
  updatedAt: string
  pushedDate?: string
  isArchived: boolean
  isFork: boolean
  readmeContent?: string
  connectedProjectId?: string
}

export interface GitHubCommitItem {
  sha: string
  repoName: string
  authorName: string
  authorAvatar?: string
  message: string
  date: string
  url: string
  additions?: number
  deletions?: number
}

export interface GitHubPRItem {
  id: string
  number: number
  title: string
  body?: string
  state: 'OPEN' | 'MERGED' | 'CLOSED' | 'DRAFT'
  createdDate: string
  mergedDate?: string
  closedDate?: string
  repoName: string
  author: string
  reviewers: string[]
  commentsCount: number
  url: string
}

export interface GitHubReviewItem {
  id: string
  prNumber: number
  prTitle: string
  repoName: string
  reviewer: string
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED'
  date: string
  url: string
}

export interface GitHubIssueItem {
  id: string
  number: number
  title: string
  body?: string
  state: 'OPEN' | 'CLOSED'
  labels: string[]
  author: string
  assignees: string[]
  createdDate: string
  updatedDate: string
  closedDate?: string
  url: string
  repoName: string
}

export interface GitHubReleaseItem {
  id: string
  name: string
  tagName: string
  description: string
  publishedDate: string
  url: string
  repoName: string
}

export interface GitHubWorkflowRunItem {
  id: string
  workflowName: string
  runNumber: number
  status: 'HEALTHY' | 'FAILING' | 'NO_CI_DATA'
  success: boolean
  duration?: string
  branch: string
  commitSha: string
  date: string
  url: string
  repoName: string
}

export interface GitHubSyncState {
  status: GitHubSyncStatus
  username: string
  avatar: string
  connectedDate?: string
  lastSync?: string
  errorMessage?: string
  repositoriesCount: number
  commitsCount: number
  prsCount: number
  issuesCount: number
}

export interface GitHubAIEvidenceSuggestion {
  id: string
  title: string
  sourcePrNumber: number
  repoName: string
  suggestedCapability: string
  summary: string
  prUrl: string
}

export interface GitHubAIProblemSuggestion {
  id: string
  title: string
  sourceIssueNumber: number
  repoName: string
  issueBody: string
  issueUrl: string
}

export interface GitHubAIActivitySuggestion {
  id: string
  title: string
  commitCount: number
  repoName: string
  dateRange: string
  suggestedWork: string
}
