import Dexie, { type Table } from 'dexie'
import { mockObservations } from '../../features/observations/data/mockObservations'
import type { Observation } from '../../features/observations/types'

export const FIREWATCH_DATABASE_NAME = 'firewatch-field-data'

export class FireWatchDatabase extends Dexie {
  observations!: Table<Observation, string>

  constructor(name = FIREWATCH_DATABASE_NAME) {
    super(name)

    this.version(1).stores({
      observations: 'id, category, severity, syncStatus, createdAt, updatedAt',
    })

    this.on('populate', (transaction) => {
      return transaction.table('observations').bulkAdd(mockObservations)
    })
  }
}

export const fireWatchDatabase = new FireWatchDatabase()
