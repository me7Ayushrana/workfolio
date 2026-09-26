'use client'

import { useState } from 'react'
import { Sparkles, X, CheckCircle2 } from 'lucide-react'
import { useWorkfolio } from '@/lib/workfolio-store'

export function RequestResourceModal({ onClose }: { onClose: () => void }) {
  const { submitResourceRequest } = useWorkfolio()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Frontend Systems')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    submitResourceRequest(title.trim(), description.trim(), category)
    setSubmitted(true)
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#193b2c]/65 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#f3eee4] p-7 text-[#193b2c] shadow-2xl border border-[#193b2c]/20">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[.2em] text-[#9b7b3b]">
              WORKFOLIO FEEDBACK LOOP
            </span>
            <h2 className="mt-1 font-serif text-3xl font-light">Request a Resource</h2>
          </div>
          <button onClick={onClose} className="text-[#193b2c]/50 hover:text-[#193b2c]">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="my-10 text-center space-y-3">
            <CheckCircle2 className="mx-auto text-[#26513d]" size={48} />
            <h3 className="font-serif text-2xl">Request Submitted!</h3>
            <p className="text-xs text-[#193b2c]/70">
              Your request has been routed to the Workfolio Admin ecosystem.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <p className="text-xs leading-relaxed text-[#193b2c]/70">
              What tools, templates, UI systems, or AI workflows would you like to see added to Explore?
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#193b2c]/80 mb-1">
                Resource Title / Idea
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Next.js Auth & Permission Starter, OCR Camera Scanner"
                className="w-full border border-[#193b2c]/20 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#193b2c]/80 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-[#193b2c]/20 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
              >
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Frontend Systems">Frontend Systems</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="Automation">Automation</option>
                <option value="Research">Research</option>
                <option value="Design Systems">Design Systems</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#193b2c]/80 mb-1">
                Why would this be useful to your work?
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe your use case, required technologies, or specific implementation details..."
                className="w-full border border-[#193b2c]/20 bg-transparent p-3 text-xs outline-none focus:border-[#9b7b3b]"
                required
              />
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-[#193b2c]/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || !description.trim()}
                className="flex items-center gap-2 bg-[#193b2c] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4] hover:bg-[#9b7b3b] disabled:opacity-40"
              >
                <Sparkles size={13} /> Submit Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
