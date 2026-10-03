import { Link } from 'react-router-dom'
import type { Subject } from '../types/subject'

interface SubjectCardProps {
  subject: Subject
}

export function SubjectCard({ subject }: SubjectCardProps) {
  return (
    <Link
      to={`/subjects/${subject.id}`}
      className="group flex flex-col h-full p-6 bg-surface rounded-card border border-border-subtle shadow-card ease-smooth transition-all duration-200 hover:shadow-float hover:-translate-y-0.5 hover:border-emerald-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <span
          aria-hidden="true"
          className="w-10 h-10 shrink-0 rounded-control flex items-center justify-center bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/10 transition-colors duration-200 group-hover:bg-emerald-100 group-hover:ring-emerald-600/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15 whitespace-nowrap">
          {subject.code}
        </span>
      </div>
      <h3 className="font-semibold text-neutral-900 leading-snug mb-2 transition-colors duration-150 group-hover:text-emerald-700">
        {subject.name}
      </h3>
      <p className="text-sm text-ink-muted leading-relaxed line-clamp-2">
        {subject.description || 'No description available.'}
      </p>
      <div className="mt-auto pt-4 flex items-center text-sm font-medium text-emerald-700 group-hover:text-emerald-800 transition-colors duration-150">
        View Details
        <svg
          className="w-4 h-4 ml-1 transition-transform duration-150 group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
