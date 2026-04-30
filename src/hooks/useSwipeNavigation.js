import { useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const ROUTES = ['/', '/weekly', '/monthly', '/yearly']
const MIN_X  = 50  // min horizontal px to count as swipe
const MAX_Y  = 80  // max vertical px before we consider it a scroll

export function useSwipeNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const start    = useRef(null)

  function onTouchStart(e) {
    start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function onTouchEnd(e) {
    if (!start.current) return
    const dx = e.changedTouches[0].clientX - start.current.x
    const dy = e.changedTouches[0].clientY - start.current.y
    start.current = null

    // Ignore if mostly vertical (user is scrolling)
    if (Math.abs(dy) > MAX_Y) return
    if (Math.abs(dx) < MIN_X) return

    const idx = ROUTES.indexOf(location.pathname)
    if (idx === -1) return

    if (dx < 0 && idx < ROUTES.length - 1) navigate(ROUTES[idx + 1])
    else if (dx > 0 && idx > 0)            navigate(ROUTES[idx - 1])
  }

  const currentIndex = ROUTES.indexOf(location.pathname)

  return { onTouchStart, onTouchEnd, currentIndex, total: ROUTES.length }
}
