import type { Observation } from '../../features/observations/types'
import { fireWatchDatabase, type FireWatchDatabase } from './firewatchDb'

export interface ObservationRepository {
  getAll(): Promise<Observation[]>
  add(observation: Observation): Promise<void>
  update(observation: Observation): Promise<void>
  delete(id: string): Promise<void>
  markPendingAsSimulated(): Promise<Observation[]>
}

export class DexieObservationRepository implements ObservationRepository {
  constructor(private readonly database: FireWatchDatabase = fireWatchDatabase) {}

  getAll(): Promise<Observation[]> {
    return this.database.observations.orderBy('createdAt').reverse().toArray()
  }

  add(observation: Observation): Promise<void> {
    return this.database.observations.add(observation).then(() => undefined)
  }

  async update(observation: Observation): Promise<void> {
    await this.database.transaction('rw', this.database.observations, async () => {
      const exists = await this.database.observations.get(observation.id)
      if (!exists) throw new Error(`Observation ${observation.id} does not exist.`)
      await this.database.observations.put(observation)
    })
  }

  delete(id: string): Promise<void> {
    return this.database.observations.delete(id)
  }

  async markPendingAsSimulated(): Promise<Observation[]> {
    return this.database.transaction('rw', this.database.observations, async () => {
      const pending = await this.database.observations.where('syncStatus').equals('Pending').toArray()
      const now = new Date().toISOString()
      const updated = pending.map((item) => ({ ...item, syncStatus: 'Simulated' as const, updatedAt: now }))
      await this.database.observations.bulkPut(updated)
      return updated
    })
  }
}

export const observationRepository = new DexieObservationRepository()
