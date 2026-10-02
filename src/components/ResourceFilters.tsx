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
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <select
        value={selectedSubject}
        onChange={(e) => onSubjectChange(e.target.value)}
        aria-label="Filter by subject"
        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
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
        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
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
