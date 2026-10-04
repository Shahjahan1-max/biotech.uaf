export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-surface-deep mt-auto">
      <div
        className="h-px bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
        aria-hidden="true"
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
        fill="none"
        viewBox="0 0 1200 220"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="#2dd4bf" strokeWidth="1.25">
          <path d="M-40 120 C 120 60 240 170 400 110 S 680 50 840 110 S 1080 170 1240 110" />
        </g>
        <g stroke="#34d399" strokeWidth="1" strokeOpacity="0.8">
          <path d="M120 78 L340 108 L560 72 L780 128 L1000 88" />
        </g>
        <g fill="#5eead4">
          <circle cx="120" cy="78" r="3.5" />
          <circle cx="340" cy="108" r="4" />
          <circle cx="560" cy="72" r="3.5" />
          <circle cx="780" cy="128" r="4" />
          <circle cx="1000" cy="88" r="3.5" />
        </g>
        <g fill="#818cf8">
          <circle cx="450" cy="150" r="3" />
          <circle cx="900" cy="55" r="2.5" />
        </g>
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-sm shadow-emerald-500/25 ring-1 ring-inset ring-white/20">
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path strokeLinecap="round" d="M7.5 3.5c0 4.5 9 4.5 9 8.5s-9 4-9 8.5" />
                <path strokeLinecap="round" d="M16.5 3.5c0 4.5-9 4.5-9 8.5s9 4 9 8.5" />
                <path strokeLinecap="round" d="M9.5 7.5h5M9.5 12h5M9.5 16.5h5" />
                <circle cx="7.5" cy="3.5" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="16.5" cy="3.5" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="7.5" cy="20.5" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="16.5" cy="20.5" r="1.4" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <div>
              <span className="text-sm font-semibold tracking-tight text-white">
                Biotechnology — Section A
              </span>
              <p className="text-xs font-medium text-cyan-300 mt-0.5">
                Lab-grade precision. Campus-grade collaboration.
              </p>
            </div>
          </div>
          <p className="text-xs font-medium text-teal-200/90 text-center sm:text-right">
            Academic Learning Platform
          </p>
        </div>
      </div>
    </footer>
  )
}
