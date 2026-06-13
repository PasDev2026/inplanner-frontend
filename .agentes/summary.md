## Goal
Complete UI improvement by migrating projects, tasks, and task children pages to shadcn components (Badge, Card, Button, Input, Select, design tokens).

## Constraints & Preferences
- **Select** component uses `@base-ui/react/select` with shadcn styling; `Select.Value` accepts `children` or `(value) => ReactNode` function for label rendering
- **Badge** created with `class-variance-authority`; variants: `default`, `secondary`, `destructive`, `outline`, `brand`, `brand-light`, `slate`
- **Card** is a simple div‑based component (no base‑ui primitive needed)
- **Input** now uses `React.forwardRef` — necessary for `react-hook-form` `reset()` to populate values
- **Textarea** now uses `React.forwardRef` as well for `react-hook-form` compatibility
- `sm:max-w-sm` removed from `DialogContent` default classes to fix compressed modals
- **Controller** from react‑hook‑form required for shadcn `Select` integration
- All new imports use `@/` aliases; every change verified with `pnpm build`

## Progress
### Done
- **All original UI Improvement fases (1–8)**: sweetalert2 → sonner, dialog/popover/menu/collapsible migrations, lucide icons, package removals
- **`Input.tsx` forwardRef fix** + **`Textarea.tsx` forwardRef fix** for react-hook-form compatibility
- **`Select` component**: new `src/components/ui/select.tsx` (base‑ui based, shadcn styled)
- **UserModal**: Area `<select>` → shadcn `Select`
- **ProjectForm**: Sede `<select>` → shadcn `Select`; raw `<input>` → `<Input>`; raw `<textarea>` → `<Textarea>`
- **Dialog fix**: removed `sm:max-w-sm` default from `DialogContent`
- **`docs/ui-improvement-plan-v2.md`**: detailed 6‑phase plan (now all ✅)

### Fase 1 (Badge) ✅
- **`Badge` component**: `src/components/ui/badge.tsx` (cva with `brand`, `brand-light`, `slate` variants)
- **ProjectTableRow**: Manager/Colaborador badges + Sede badge → `<Badge>`

### Fase 2 (Card) ✅
- **`Card` component**: `src/components/ui/card.tsx` (div‑based, shadcn tokens)
- **TaskCard**: raw `<li>` → `<Card>` with `<CardContent>`
- **DashboardPage**: project table wrapped in `<Card>`; "Cargar más" button → `<Button variant="outline">`
- **ProjectDetailPage**: project info wrapped in `<Card>`; SVG icons → `lucide-react` (`Plus`, `Users`); added imports

### Fase 3 (Button/Input) ✅
- **CreateTaskModal**: raw `<button>` → `<Button>`; raw `<input>`/`<textarea>` in TaskForm → `<Input>`/`<Textarea>`
- **ProjectCreatePage**: raw `<button>` → `<Button>`
- **EditProjectForm**: raw `<button>` → `<Button>`
- **DeleteProjectModal**: raw `<input>` → `<Input>`; raw `<input type="submit">` → `<Button variant="destructive">`
- **EditTaskModal**: raw `<input type="submit">` → `<Button>`
- **TeamPage**: "Agregar Colaborador" button → `<Button>`
- **AddMemberForm**: raw `<input>` → `<Input>`; raw `<input type="submit">` → `<Button>`

### Fase 4 (Select) ✅
- **TaskModalDetails**: status raw `<select>` → shadcn `<Select>` with `onValueChange`

### Fase 5 (Tokens) ✅
Replaced `slate-*` with shadcn CSS variables across ~15 files:
- `text-slate-400/500/600` → `text-muted-foreground`
- `text-slate-700/800/900` → `text-foreground`
- `border-slate-100/200/300` → `border-border`
- `bg-slate-50/100` → `bg-muted`
- `hover:bg-slate-50` → `hover:bg-muted`
- Semantic status colors (`bg-slate-500` for dots, `bg-slate-50` for column bg) kept as-is

### Fase 6 (Marca) ✅
- **DateBadge**: `bg-blue-50 text-blue-600 border-blue-200` → `bg-brand-primary/10 text-brand-primary border-brand-primary/20`
- **NotFoundPage**: `text-blue-600` → `text-brand-primary`
- **TeamPage Link**: `bg-fuchsia-600` → `bg-brand-primary`
- **AddMemberForm**: `bg-fuchsia-600 submit` → `<Button>`

## Build Metrics
- Modules: 3636 (stable)
- CSS: ~99.69 kB (reduced from 100.53 kB)
- JS: ~1,058.48 kB (reduced from 1,059.27 kB)
- Build time: ~11-30s

## Key Decisions
- `Badge` uses `class-variance-authority` with explicit brand variants matching existing app colors
- `Select.Value` resolves labels manually via `children` because base‑ui does not automatically extract `ItemText` content for display
- `sm:max-w-sm` removed from `DialogContent` because `tailwind-merge` cannot override a responsive class with a non‑responsive one
- Status-semantic colors (`bg-slate-500`, `bg-blue-500`, etc.) preserved — they are intentional status indicators, not legacy colors
- `divide-slate-100` kept as-is (Tailwind `divide-border` may not resolve without explicit theme config)
- Plan stored at `docs/ui-improvement-plan-v2.md`

## Relevant Files
- **v2 plan**: `docs/ui-improvement-plan-v2.md`
- **Badge**: `src/components/ui/badge.tsx`
- **Card**: `src/components/ui/card.tsx`
- **Select**: `src/components/ui/select.tsx`
- **Input (fixed)**: `src/components/ui/input.tsx`
- **Textarea (fixed)**: `src/components/ui/textarea.tsx`
- **Dialog (fixed)**: `src/components/ui/dialog.tsx`
