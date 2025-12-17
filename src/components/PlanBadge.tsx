export function getPlanBadgeClass(plan: string) {
  const base =
    "px-3 py-1 rounded-full text-sm font-medium border backdrop-blur-sm shadow-[0_0_8px_rgba(255,255,255,0.06)]";

  switch (plan.toLowerCase()) {
    case "killore":
      return `${base} bg-gradient-to-r from-pink-500/20 via-fuchsia-500/20 to-pink-400/20 text-pink-300 border-pink-600/40`;

    case "broke haunted":
      return `${base} bg-gradient-to-r from-sky-500/20 via-cyan-500/20 to-sky-400/20 text-cyan-300 border-cyan-600/40`;

    case "haunted":
      return `${base} bg-gradient-to-r from-purple-500/20 via-fuchsia-600/20 to-indigo-500/20 text-purple-300 border-purple-600/40`;

    default:
      return `${base} bg-slate-800/40 text-slate-300 border-slate-700`;
  }
}









