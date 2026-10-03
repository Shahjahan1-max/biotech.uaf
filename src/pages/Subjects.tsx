import { useEffect, useState } from 'react'
import { Spinner } from '../components/Spinner'
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
        <div className="flex items-center justify-center py-16">
          <Spinner label="Loading" />
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Error Loading Subjects</h3>
          <p className="text-sm text-neutral-500">{error}</p>
        </div>
      )}

      {!isLoading && !error && <SubjectGrid subjects={subjects} />}
    </div>
  )
}
