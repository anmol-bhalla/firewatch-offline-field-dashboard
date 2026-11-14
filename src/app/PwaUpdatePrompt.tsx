import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh && !offlineReady) return null

  return (
    <aside className="pwa-notice" role="status">
      <span>{needRefresh ? 'A FireWatch update is ready.' : 'FireWatch is ready to launch offline.'}</span>
      {needRefresh && <button type="button" onClick={() => { void updateServiceWorker(true) }}>Reload to update</button>}
      <button type="button" aria-label="Dismiss notification" onClick={() => { setNeedRefresh(false); setOfflineReady(false) }}>Dismiss</button>
    </aside>
  )
}
