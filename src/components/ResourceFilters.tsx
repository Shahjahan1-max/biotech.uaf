import type { ResourceType } from '../types/resource'

interface ResourceFiltersProps {
  subjects: { id: string; name: string; code: string }[]
  selectedSubject: string
  selectedType: ResourceType | ''
  onSubjectChange: (subjectId: string) => void
  onTypeChange: (type: ResourceType | '') => void
}

const resourceTypes: { value: ResourceType; label: string }[] = [
  { value: 'NOTE', label: 'Lecture Notes' },
  { value: 'STUDY_GUIDE', label: 'Study Guides' },
  { value: 'PRESENTATION', label: 'Presentations' },
  { value: 'REFERENCE', label: 'Reference' },
  { value: 'OTHER', label: 'Other' },
]

export function ResourceFilters({
  subjects,
  selectedSubject,
  selectedType,
  onSubjectChange,
  onTypeChange,
}: ResourceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <select
        value={selectedSubject}
        onChange={(e) => onSubjectChange(e.target.value)}
        aria-label="Filter by subject"
        className="w-full sm:w-auto min-w-0 px-3 py-2 bg-surface text-ink-strong border border-border-subtle rounded-control text-sm cursor-pointer transition-colors duration-150 ease-smooth hover:border-neutral-300 focus:outline-none focus:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <option value="">All Subjects</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.code} — {s.name}
          </option>
        ))}
      </select>

      <select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value as ResourceType | '')}
        aria-label="Filter by resource type"
        className="w-full sm:w-auto min-w-0 px-3 py-2 bg-surface text-ink-strong border border-border-subtle rounded-control text-sm cursor-pointer transition-colors duration-150 ease-smooth hover:border-neutral-300 focus:outline-none focus:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <option value="">All Types</option>
        {resourceTypes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  )
}
