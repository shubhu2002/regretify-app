# Regretify → "Ultra" (ultramail.ai) design conversion guide

The app is being restyled to match ultramail.ai exactly: a pure-black, monochrome, premium dark UI. The app is now DARK-ONLY (next-themes is forcedTheme='dark'; html always has class="dark").

## Hard rules

1. Remove ALL light-theme styling and ALL `dark:` variants. Write single-theme classes only (the dark look IS the theme). E.g. `bg-white dark:bg-slate-800` → `bg-white/[0.06]`.
2. Eliminate the violet/fuchsia accent palette entirely. Old purple/violet/fuchsia/slate Tailwind classes must not survive. The accent system is: WHITE for chrome, plus Ultra's pastel accent set (see "Pastel accents" below) for labels, icon chips, and highlights.
3. Keep ALL logic, props, handlers, structure, framer-motion animations, and accessibility exactly as-is. This is a styling-only pass — change classNames (and hardcoded style colors) only.
4. Semantic colors stay but muted: red for danger/expense (`text-red-400`, `bg-red-500/10`, buttons `bg-red-500 hover:bg-red-600 text-white`), emerald for success/income (`text-emerald-400`, `bg-emerald-500/10`).

## Token vocabulary (use these consistently)

- Page background: pure black (body is already `bg-black text-white`). Remove page-level `bg-slate-*` wrappers; leave transparent or `bg-transparent`.
- Card / panel: `bg-white/[0.04]` to `bg-white/[0.06]` with `border border-white/10 rounded-2xl` (large hero cards: `rounded-3xl`). No colored shadows; use `shadow-xl shadow-black/40` only where a shadow existed before.
- Solid popover/modal surface: `bg-[#101013]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/60`; modal overlay: `bg-black/60 backdrop-blur-md`.
- Raised/hover surface: `bg-white/[0.08]`, hover `hover:bg-white/10` or `hover:bg-white/[0.14]`.
- Borders/dividers: `border-white/10` (subtle: `border-white/[0.08]`, divide: `divide-white/[0.08]`).
- Text hierarchy: headings `text-white font-semibold tracking-tight` (avoid font-extrabold/black — ultramail uses medium/semibold weights); body `text-white/80`; secondary `text-white/50`; muted/placeholder `text-white/40`; disabled `text-white/30`.
- Hero/display headlines (big marketing text): add class `text-gradient` (defined in globals.css: white→white/50 gradient text) + `font-medium tracking-tight text-white` fallback.
- Primary button (CTA): `bg-white hover:bg-white/90 text-black font-medium rounded-xl glow-white-sm transition-all` (hero CTAs may use `glow-white` for the big glow). NEVER violet buttons.
- Secondary button: `bg-white/[0.08] hover:bg-white/[0.14] text-white/80 border border-white/10 rounded-xl`.
- Ghost/icon button: `text-white/50 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors`.
- Inputs/textareas: `bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-white/30 focus:ring-2 focus:ring-white/10 focus:outline-none`.
- Active/selected states (tabs, list items, toggles): `bg-white/10 text-white` (inactive: `text-white/50 hover:text-white/80`).
- Skeletons/pulse: `bg-white/[0.06]` or `bg-white/10 animate-pulse`.
- Icon accents that were `text-violet-*`: use `text-white/80` (or `text-white/50` if decorative).
- Avatar/image fallback bg: `bg-white/10`.
- Charts (recharts etc.): monochrome — series in white and white alphas (`#ffffff`, `rgba(255,255,255,0.65)`, `rgba(255,255,255,0.4)`, `rgba(255,255,255,0.2)`); grid/axis lines `rgba(255,255,255,0.08)`; axis text `rgba(255,255,255,0.4)`; tooltip surface `#101013` with `1px solid rgba(255,255,255,0.1)`. Income/expense series may keep emerald-400/red-400.
- Toggle/segment controls: container `bg-white/[0.05] border border-white/[0.08] rounded-xl p-1`, active segment `bg-white/10 rounded-lg text-white`.

## Available custom CSS classes (globals.css)

- `.text-gradient` — silver gradient headline text
- `.glow-white` — `0 4px 52px rgba(255,255,255,0.35)` (hero CTA glow)
- `.glow-white-sm` — `0 2px 24px rgba(255,255,255,0.2)` (standard CTA glow)

## Reference components already converted (match their feel)

- src/components/Navbar.tsx, src/components/ConfirmModal.tsx, src/components/ui/Button.tsx, src/components/ui/CustomSelect.tsx, src/components/background.tsx, src/providers/Providers.tsx

## Checklist before finishing

- `grep -n 'slate-\|violet-\|fuchsia-\|dark:' <your files>` must return nothing (except non-color matches like variable names).
- No `bg-white ` (opaque white) surfaces except primary buttons' `bg-white` and avatar images.
- Typography: no `font-extrabold`/`font-black` — downgrade to `font-semibold`.
- File compiles: run `npx tsc --noEmit` if unsure about syntax you touched (styling-only edits rarely need it).
