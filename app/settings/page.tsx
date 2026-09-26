import { WorkfolioHeader } from '@/components/workfolio-header'
import { AISettings } from '@/components/settings/ai-settings'

export const metadata = {
  title: 'Settings & AI Architecture | Workfolio',
  description: 'Manage BYOK AI Provider configurations, Gemini, Groq, and GitHub Integrations.'
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#08090f] text-[#f3eee4]">
      <WorkfolioHeader />
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <AISettings />
      </main>
    </div>
  )
}
