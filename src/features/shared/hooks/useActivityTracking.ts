import { useEffect, useRef } from 'react'
import { getSocket } from '@/features/shared/lib/socket'

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const
const THROTTLE_MS = 30_000

export function useActivityTracking() {
  const lastPingRef = useRef<number>(Date.now())

  useEffect(() => {
    const handleActivity = () => {
      const now = Date.now()
      if (now - lastPingRef.current < THROTTLE_MS) return
      lastPingRef.current = now

      const socket = getSocket()
      if (socket?.connected) {
        socket.emit('ping')
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        lastPingRef.current = 0
        handleActivity()
      }
    }

    for (const event of ACTIVITY_EVENTS) {
      document.addEventListener(event, handleActivity, { passive: true })
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        document.removeEventListener(event, handleActivity)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
