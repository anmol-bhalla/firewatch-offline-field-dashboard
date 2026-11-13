export type ObservationSeverity = 'Critical' | 'High' | 'Moderate' | 'Low'

export type Observation = {
  id: string
  title: string
  location: string
  category: string
  severity: ObservationSeverity
  observedAt: string
  status: 'Pending sync' | 'Synced'
  initials: string
  color: string
}

export const mockObservations: Observation[] = [
  { id: 'FW-2481', title: 'Smoke column observed', location: 'Sooke Hills · Sector 04', category: 'Smoke', severity: 'High', observedAt: '9:42 AM', status: 'Pending sync', initials: 'JM', color: 'violet' },
  { id: 'FW-2480', title: 'Unattended campfire', location: 'Goldstream Park · Sector 02', category: 'Flame', severity: 'Critical', observedAt: '9:18 AM', status: 'Synced', initials: 'AK', color: 'amber' },
  { id: 'FW-2479', title: 'Dry fuel conditions', location: 'Mount Work · Sector 07', category: 'Fuel', severity: 'Moderate', observedAt: '8:56 AM', status: 'Synced', initials: 'RL', color: 'cyan' },
  { id: 'FW-2478', title: 'New access road cleared', location: 'Malahat Ridge · Sector 03', category: 'Access', severity: 'Low', observedAt: '8:31 AM', status: 'Pending sync', initials: 'TS', color: 'rose' },
]
