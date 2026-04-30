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

## State & Performance

From the architecture evaluation:

- [ ] Fix `useHabitCelebrations` running once on mount — milestones hit mid-session don't show on Today until reload
- [ ] QuickCapture adding a task doesn't refresh the Today list in the same session
- [ ] `useDashboard` goes stale as you complete tasks — no reactivity
- [ ] Batch `useHabitHistory` queries (currently one query per habit on the Habits page)
- [ ] Fix `useDashboard` fetching completions twice
- [ ] Add error handling to QuickCapture — currently closes modal silently on failure

---

## Dead Code Cleanup

Left over from refactoring:

- [ ] Remove unused `addItem` destructure in `Monthly.jsx` and `Yearly.jsx`
- [ ] Remove unused `StarIcon` in `NavBar.jsx`
- [ ] Audit `CaptureIdeaModal.jsx` — exists but imported nowhere

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
