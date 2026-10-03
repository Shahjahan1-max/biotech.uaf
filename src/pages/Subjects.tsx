import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { SectionHeader } from '../components/SectionHeader'
import { SubjectGrid } from '../components/SubjectGrid'
import { getSubjects } from '../services/subjects'
import type { Subject } from '../types/subject'

export function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch(() => setError('Failed to load subjects'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader
        as="h1"
        title="Subjects"
        subtitle="Explore your biotechnology courses"
      />

      {isLoading && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading</span>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className="p-6 bg-surface rounded-card border border-border-subtle shadow-card animate-pulse"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-control bg-neutral-200/70" />
                <div className="h-5 w-14 rounded-full bg-neutral-100" />
              </div>
              <div className="h-4 w-3/5 rounded bg-neutral-200/70 mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-neutral-100" />
                <div className="h-3 w-4/5 rounded bg-neutral-100" />
              </div>
              <div className="h-3.5 w-24 rounded bg-neutral-200/70 mt-6" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500 ring-1 ring-inset ring-red-600/20"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </span>
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-1">Error Loading Subjects</h3>
              <p className="text-sm text-neutral-500">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {!isLoading && !error && <SubjectGrid subjects={subjects} />}
    </div>
  )
}
