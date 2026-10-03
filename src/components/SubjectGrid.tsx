import type { Subject } from '../types/subject'
import { SubjectCard } from './SubjectCard'
import { Button } from './Button'

interface SubjectGridProps {
  subjects: Subject[]
  onEdit?: (subject: Subject) => void
  onDelete?: (subject: Subject) => void
}

export function SubjectGrid({ subjects, onEdit, onDelete }: SubjectGridProps) {
  if (subjects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-1">No Subjects Yet</h3>
        <p className="text-sm text-neutral-500">
          Subjects will appear here once they are added by administrators.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject) => (
        <div key={subject.id}>
          <SubjectCard subject={subject} />
          {(onEdit || onDelete) && (
            <div className="mt-2 flex gap-2">
              {onEdit && <Button size="sm" variant="outline" onClick={() => onEdit(subject)}>Edit</Button>}
              {onDelete && <Button size="sm" variant="ghost" onClick={() => onDelete(subject)}>Delete</Button>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
