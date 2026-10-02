import { Link } from 'react-router-dom'
import type { Subject } from '../types/subject'

interface SubjectCardProps {
  subject: Subject
}

export function SubjectCard({ subject }: SubjectCardProps) {
  return (
    <Link
      to={`/subjects/${subject.id}`}
      className="block bg-white rounded-xl border border-neutral-200 p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          {subject.code}
        </span>
      </div>
      <h3 className="font-semibold text-neutral-900 mb-2 group-hover:text-emerald-700 transition-colors">
        {subject.name}
      </h3>
      <p className="text-sm text-neutral-500 line-clamp-2">
        {subject.description || 'No description available.'}
      </p>
      <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
        View Details
        <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
