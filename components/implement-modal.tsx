'use client'

import { useState } from 'react'
import { CheckCircle2, FolderPlus, Layers, Plus, X } from 'lucide-react'
import { ExploreResource, useWorkfolio } from '@/lib/workfolio-store'

interface ImplementModalProps {
  resource: ExploreResource
  onClose: () => void
  onSuccess?: (projectId: string) => void
}

export function ImplementModal({ resource, onClose, onSuccess }: ImplementModalProps) {
  const { projects, implementResource, createProjectAndImplement } = useWorkfolio()
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '')
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectCategory, setNewProjectCategory] = useState(resource.category || 'AI')
  const [notes, setNotes] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)

  const handleConfirm = () => {
    let targetProjectId = selectedProjectId
    if (mode === 'new') {
      if (!newProjectName.trim()) return
      const imp = createProjectAndImplement(
        resource.id,
        newProjectName.trim(),
        newProjectCategory
      )
      targetProjectId = imp.projectId
    } else {
      if (!selectedProjectId) return
      implementResource(resource.id, selectedProjectId, notes)
    }

    setIsCompleted(true)
    setTimeout(() => {
      onSuccess?.(targetProjectId)
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0c0d14]/65 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#f3eee4] p-7 text-[#111318] shadow-2xl border border-[#0c0d14]/20">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[.2em] text-[#9b7b3b]">
              WORKFOLIO IMPLEMENTATION
            </span>
            <h2 className="mt-1 font-serif text-3xl font-light">Implement Resource</h2>
          </div>
          <button onClick={onClose} className="text-[#111318]/50 hover:text-[#111318]">
            <X size={18} />
          </button>
        </div>

        {/* Resource Banner */}
        <div className="mt-5 border border-[#0c0d14]/15 bg-[#e5dac9] p-4 flex items-center gap-3">
          <Layers className="text-[#9b7b3b] shrink-0" size={24} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-bold uppercase tracking-[.15em] bg-[#0c0d14] text-[#f3eee4] px-1.5 py-0.5">
                {resource.type}
              </span>
              <strong className="font-serif text-lg font-normal">{resource.title}</strong>
            </div>
            <p className="text-xs text-[#111318]/65">Version {resource.version} · Created by {resource.createdBy}</p>
          </div>
        </div>

        {isCompleted ? (
          <div className="my-10 text-center space-y-3">
            <CheckCircle2 className="mx-auto text-[#c1a05b]" size={48} />
            <h3 className="font-serif text-2xl">Implementation Created!</h3>
            <p className="text-xs text-[#111318]/70">
              The implementation record has been linked to your project history.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/80 mb-2">
                Where would you like to use this resource?
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('existing')}
                  className={`border p-3 text-left transition-colors ${
                    mode === 'existing'
                      ? 'border-[#0c0d14] bg-[#0c0d14] text-[#f3eee4]'
                      : 'border-[#0c0d14]/20 bg-transparent text-[#111318]'
                  }`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-[.14em]">
                    Existing Project
                  </span>
                  <span className="text-[9px] opacity-75">Attach to active work</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('new')}
                  className={`border p-3 text-left transition-colors ${
                    mode === 'new'
                      ? 'border-[#0c0d14] bg-[#0c0d14] text-[#f3eee4]'
                      : 'border-[#0c0d14]/20 bg-transparent text-[#111318]'
                  }`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-[.14em]">
                    New Project
                  </span>
                  <span className="text-[9px] opacity-75">Start fresh implementation</span>
                </button>
              </div>
            </div>

            {mode === 'existing' ? (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/80 mb-1">
                  Select Target Project
                </label>
                {projects.length ? (
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2.5 text-xs outline-none focus:border-[#9b7b3b]"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="text-[#111318]">
                        {p.name} ({p.category} — {p.status})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-[#7c2634]">No existing projects found. Switch to New Project.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/80 mb-1">
                    New Project Name
                  </label>
                  <input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. Finance Dashboard Implementation"
                    className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/80 mb-1">
                    Category
                  </label>
                  <input
                    value={newProjectCategory}
                    onChange={(e) => setNewProjectCategory(e.target.value)}
                    placeholder="e.g. AI / Development"
                    className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/80 mb-1">
                Implementation Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Specific scope, version details or customization plans..."
                className="w-full border border-[#0c0d14]/20 bg-transparent p-3 text-xs outline-none focus:border-[#9b7b3b]"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-[#0c0d14]/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.16em]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={mode === 'new' && !newProjectName.trim()}
                className="bg-[#0c0d14] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4] hover:bg-[#9b7b3b] disabled:opacity-40"
              >
                Confirm Implementation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
