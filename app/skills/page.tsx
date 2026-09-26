import { redirect } from 'next/navigation'

export default function SkillsRedirectPage() {
  redirect('/learning?tab=SKILLS')
}
