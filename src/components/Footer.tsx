export function Footer() {
  return (
    <footer className="bg-white/85 backdrop-blur-md mt-auto">
      <div
        className="h-px bg-gradient-to-r from-emerald-500/50 via-teal-500/30 to-transparent"
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md flex items-center justify-center shadow-sm shadow-emerald-600/25">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="text-sm font-medium tracking-tight text-neutral-600">
              Biotechnology — Section A
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Academic Learning Platform
          </p>
        </div>
      </div>
    </footer>
  )
}
