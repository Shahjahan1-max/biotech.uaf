import { Button } from '../components/Button'

export function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">404</p>
      <h1 className="text-3xl font-bold text-neutral-900 mb-3">Page not found</h1>
      <p className="text-neutral-500 mb-8">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="flex justify-center gap-3">
        <Button variant="primary" to="/">Back to Home</Button>
        <Button variant="outline" to="/subjects">Browse Subjects</Button>
      </div>
    </div>
  )
}
