import type { Subject } from '../types/subject'
import { Card } from './Card'
import { SubjectCard } from './SubjectCard'

interface SubjectGridProps {
  subjects: Subject[]
}

export function SubjectGrid({ subjects }: SubjectGridProps) {
  if (subjects.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 ring-1 ring-inset ring-neutral-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No Subjects Yet</h3>
            <p className="text-sm text-neutral-500">
              Subjects will appear here once they are added by administrators.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {subjects.map((subject) => (
        <SubjectCard key={subject.id} subject={subject} />
      ))}
    </div>
  )
}
