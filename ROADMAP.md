# Roadmap & Future Updates

A running list of deferred features, improvements, and ideas. Items are grouped by area and roughly ordered by priority within each group. This file is updated as the app evolves.

---

## Settings & Account Page

A dedicated settings/profile page (future route `/settings`) to house:

- Display name
- Default context (Work / Home / All)
- Week start day (Sunday vs Monday)
- Notification preferences (once push notifications are added)
- Sign out (currently only in desktop sidebar)
- Account deletion / data export
- Theme override (force light or dark regardless of OS setting)

---

## Offline Support

Currently the app requires internet for everything. Priority items:

- [ ] Add `vite-plugin-pwa` — service worker caches the app shell so it loads without network
- [ ] Migrate hooks to TanStack Query — serves reads from cache instantly, queues writes when offline, syncs on reconnect
- [ ] Offline indicator banner when network is lost
- [ ] Most critical use case: logging a habit completion at the gym / on the subway

---

## Health & Hobbies

Planned expansion of the habit system. The core habit architecture (type column, heatmaps, streaks, milestones) was designed to support this.

- [ ] Health section — workouts, sleep, water, nutrition tracking
- [ ] Hobbies section — reading, creative projects, learning goals
- [ ] Decide whether these are categories within Habits or separate nav items
- [ ] Potential: health metrics log (weight, resting HR, etc.) with simple trend line

---

## Monthly & Yearly Review

The weekly review (habit bars + completed tasks) proved useful. Apply the same pattern:

- [ ] Monthly review panel on the Monthly page — habit completion % for the month, tasks done
- [ ] Yearly review panel on the Yearly page — highlight streaks, milestones hit, goals completed
- [ ] Consider a standalone `/review` route for a full retrospective view

---

## Notifications & Reminders

- [ ] Push notifications (requires PWA service worker first)
- [ ] Habit reminder at a user-set time: "You haven't logged [habit] yet today"
- [ ] Weekly review prompt — Sunday evening nudge to open the week review
- [ ] 7-day dormancy alert for habits (currently shown inline on the Habits page; could be a push notification)

---

## Architecture Fixes

These are known issues identified during a full codebase evaluation. Each entry includes the file, the problem, and the fix required.

---

### 1. `useHabitCelebrations` is stale after first load

**File:** `src/hooks/useHabitCelebrations.js`  
**Problem:** The hook uses `useEffect` with an empty dependency array `[]`, so it only runs once when the Today page mounts. If a user completes a habit during the session and that completion crosses a milestone (e.g. hits day 7), the celebration banner on the Today screen will not appear until the user reloads the page.  
**Fix:** The hook needs to re-run when habit completions change. The cleanest solution is to accept a `completedHabitIds` prop or dependency from `useHabits` so it re-fires when the completion list changes. Alternatively, migrate to TanStack Query with a shared query key so all habit-related queries invalidate together.

---

### 2. QuickCapture does not refresh the Today task list

**File:** `src/components/ui/QuickCaptureModal.jsx` and `src/hooks/useItems.js`  
**Problem:** When a task is added via QuickCapture, it inserts directly into the `items` table via Supabase. The `useItems('daily')` hook in `Today.jsx` has its own isolated state. These two are not connected — the Today list will not show the new task until the user navigates away and back, or manually refreshes.  
**Fix:** Two options:
- (Simple) Export a `reload` function from `useItems` and pass it as a callback to QuickCaptureModal via context or prop drilling through AppLayout.
- (Better) Lift item state up or use TanStack Query with a shared `['items', 'daily']` query key, so QuickCapture can call `queryClient.invalidateQueries(['items', 'daily'])` after insert.

---

### 3. `useDashboard` goes stale throughout the session

**File:** `src/hooks/useDashboard.js`  
**Problem:** Dashboard summary cards (work tasks, home tasks, overdue counts) fetch once on mount and never update. As the user completes tasks on Today/Weekly/etc., the dashboard numbers fall out of sync without a page reload.  
**Fix:** Add a `reload` function to `useDashboard` and call it when the Dashboard component becomes visible (using a `visibilitychange` listener or a focus-based `useEffect`). Or — better long-term — use TanStack Query so completing a task invalidates the dashboard query automatically.

---

### 4. `useDashboard` fetches completions twice

**File:** `src/hooks/useDashboard.js`  
**Problem:** The hook runs two separate Supabase queries for completions — one when processing work/home task counts, and a second when processing project tasks. This is two round-trips for data that could be fetched in one query.  
**Fix:** Fetch all completions for today's date in a single query at the top of the `load` function, then reuse that result for both task and project calculations. The query is: `completions` where `log_date = today()` and `item_id IN [all item ids]`.

---

### 5. N+1 queries on the Habits page (`useHabitHistory`)

**File:** `src/hooks/useHabitHistory.js` and `src/components/habits/HabitHeatmap.jsx`  
**Problem:** Every `HabitHeatmap` component independently calls `useHabitHistory(habitId)`, which fires one Supabase query per habit. With 10 habits on screen, that is 10 concurrent queries to the `completions` table fetching 84 days of data each. Works fine now at small scale, will degrade as habit count grows.  
**Fix:** Create a `useAllHabitHistories(habitIds)` parent hook that fetches completions for ALL habits in a single query (`item_id IN [all ids]`), then slices the result per habit and passes it down as props to each `HabitHeatmap`. `HabitHeatmap` would accept pre-computed `grid`, `streak`, `bestStreak`, `milestones` props instead of calling `useHabitHistory` itself.

---

### 6. QuickCapture closes silently on Supabase failure

**File:** `src/components/ui/QuickCaptureModal.jsx`, `handleSubmit` function  
**Problem:** The Supabase insert calls (`supabase.from(...).insert(...)`) are awaited but the `error` return value is never checked. If the insert fails (network error, RLS violation, schema mismatch), the modal closes and the user has no indication their data was not saved.  
**Fix:** Destructure `{ error }` from each insert call. If error is truthy, set a local `errorMsg` state and display it inside the modal instead of calling `onClose()`. Example:
```js
const { error } = await supabase.from('items').insert({ ... })
if (error) { setError('Could not save. Try again.'); setSaving(false); return }
onClose()
```

---

### 7. Stale state when promoting ideas to tasks/habits

**File:** `src/hooks/useIdeas.js` — `promoteToTask`, `promoteToHabit`  
**Problem:** Both promote functions insert a new row into `items` and delete the idea. The idea is removed from `useIdeas` state correctly, but the new item does not appear in `useItems` or `useHabits` state until the user navigates to that page. A user who promotes an idea to a task and goes straight to Today will not see it.  
**Fix:** Same as item 2 — either export `reload` from the destination hook and call it after promotion, or use TanStack Query invalidation.

---

### 8. Missing error boundary — uncaught hook errors crash the page

**File:** `src/App.jsx`  
**Problem:** There is no React error boundary wrapping the app or individual pages. If any hook throws an unhandled exception (Supabase network error, malformed response, etc.), the entire page goes blank with no recovery path for the user.  
**Fix:** Add a simple error boundary component in `src/components/ErrorBoundary.jsx` and wrap `AppLayout` with it in `App.jsx`. The boundary should catch render errors and show a "Something went wrong — tap to reload" fallback instead of a blank screen.

---

## Dead Code Cleanup

Left over from the FAB refactor and earlier iterations. These are safe to delete:

- [ ] `Monthly.jsx` — `addItem` is destructured from `useItems()` on line 15 but never used. Remove it from the destructure.
- [ ] `Yearly.jsx` — same issue, `addItem` destructured but unused.
- [ ] `NavBar.jsx` — `StarIcon` SVG component is defined but never referenced in the nav links array or rendered anywhere.
- [ ] `src/components/ui/CaptureIdeaModal.jsx` — file exists but is not imported or used anywhere in the app. Likely superseded by `QuickCaptureModal`. Confirm it is unused then delete.

---

## UX & Polish

- [ ] Empty state illustrations — the "Nothing on the list" states are plain text
- [ ] Swipe dots are only shown for Today/Week/Month/Year — consider hiding entirely on other pages
- [ ] Habit heatmap cell tooltip — show the date in a readable format (currently YYYY-MM-DD)
- [ ] Drag-to-reorder habits and tasks
- [ ] Archive view — see completed/archived habits and projects
- [ ] Search across all items and ideas

---

## Ideas → Projects Flow

- [ ] When promoting an idea to a project, pre-fill the project title from the idea
- [ ] Link ideas to existing projects (not just "create new project task")
- [ ] Idea aging — surface ideas that have sat in inbox for 7+ days

---

## Data & Export

- [ ] CSV export of completions (habit history)
- [ ] Weekly/monthly summary email (optional, user-configured)
- [ ] Data portability — export everything as JSON

---

## Changelog

| Date | Version | What shipped |
|------|---------|--------------|
| 2026-04-30 | — | Milestone celebrations and dormancy warnings |
| 2026-04-30 | — | Universal quick capture FAB |
| 2026-04-30 | — | Idea → habit promotion |
| 2026-04-30 | — | Overdue tasks surfaced on Today |
| 2026-04-30 | — | Weekly review (habits + all completed tasks) |
| 2026-04-30 | — | Habits vs Tasks architecture (type column) |
| 2026-04-30 | — | Work / Home context system |
| 2026-04-30 | — | GitHub-style habit heatmaps with milestones |
| 2026-04-30 | — | Ideas capture and promote flow |
| 2026-04-30 | — | Projects with multi-step tasks |
| 2026-04-30 | — | Dashboard with Work/Home summary cards |
| 2026-04-30 | — | Swipe navigation between time views |
| 2026-04-30 | — | Dark mode (OS-based, zinc palette) |
