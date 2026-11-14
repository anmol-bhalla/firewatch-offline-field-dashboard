import { useEffect, useState } from 'react'

function readOnlineStatus(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(readOnlineStatus)
  useEffect(() => {
    const online = () => setIsOnline(true)
    const offline = () => setIsOnline(false)
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    return () => {
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offline)
    }
  }, [])
  return isOnline
}
