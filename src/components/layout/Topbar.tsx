export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-white/5 bg-[#050815]/90 px-6 backdrop-blur">
      <div className="text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
        Haunted Admin
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden max-w-xs flex-1 items-center gap-2 rounded-full border border-white/10 bg-[#0b1020] px-4 py-1.5 text-sm text-slate-200 ring-offset-[#050815] focus-within:ring-2 focus-within:ring-[#6366f1] md:flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.35-4.35m0-5.4a7.35 7.35 0 1 1-14.7 0 7.35 7.35 0 0 1 14.7 0Z"
            />
          </svg>
          <input
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none"
            placeholder="Search members, admins..."
            aria-label="Search"
          />
        </div>
      </div>
    </header>
  );
}







