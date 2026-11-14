import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, describe, expect, it } from 'vitest'
import { mockObservations } from '../../features/observations/data/mockObservations'
import type { Observation } from '../../features/observations/types'
import { DexieObservationRepository } from './observationRepository'
import { FireWatchDatabase } from './firewatchDb'

let databaseSequence = 0
const openDatabases: FireWatchDatabase[] = []

function createTestDatabase(name = `firewatch-test-${Date.now()}-${databaseSequence++}`): FireWatchDatabase {
  const database = new FireWatchDatabase(name)
  openDatabases.push(database)
  return database
}

function createTestObservation(): Observation {
  return {
    id: 'FW-TEST-1',
    title: 'Test smoke observation',
    category: 'Smoke',
    severity: 'Medium',
    description: 'A deterministic repository fixture.',
    latitude: 48.4,
    longitude: -123.3,
    createdAt: '2026-11-13T18:00:00.000Z',
    updatedAt: '2026-11-13T18:00:00.000Z',
    syncStatus: 'Pending',
  }
}

afterEach(async () => {
  const databases = openDatabases.splice(0)
  databases.forEach((database) => database.close())
  const latestByName = new Map(databases.map((database) => [database.name, database]))
  await Promise.all([...latestByName.keys()].map((name) => Dexie.delete(name)))
})

describe('Dexie observation repository', () => {
  it('seeds the existing preview observations only when the database is first created', async () => {
    const database = createTestDatabase()
    const repository = new DexieObservationRepository(database)

    expect(await repository.getAll()).toHaveLength(mockObservations.length)
    expect(await database.observations.toArray()).toEqual(expect.arrayContaining(mockObservations))
    expect((await repository.getAll()).filter((observation) => observation.syncStatus === 'Simulated')).toHaveLength(2)
  })

  it('does not reseed if an existing database has an empty observations table', async () => {
    const firstDatabase = createTestDatabase()
    const databaseName = firstDatabase.name
    await firstDatabase.open()
    await firstDatabase.observations.clear()
    firstDatabase.close()

    const reopenedDatabase = createTestDatabase(databaseName)
    const repository = new DexieObservationRepository(reopenedDatabase)
    expect(await repository.getAll()).toEqual([])
  })

  it('persists create and update operations across database reinitialization and persists deletion', async () => {
    const database = createTestDatabase()
    const repository = new DexieObservationRepository(database)
    const observation = createTestObservation()

    await repository.add(observation)
    database.close()

    const reopenedDatabase = new FireWatchDatabase(database.name)
    openDatabases.push(reopenedDatabase)
    const reopenedRepository = new DexieObservationRepository(reopenedDatabase)
    expect(await reopenedRepository.getAll()).toContainEqual(observation)

    const updated = { ...observation, title: 'Updated smoke observation', syncStatus: 'Pending' as const, updatedAt: '2026-11-13T19:00:00.000Z' }
    await reopenedRepository.update(updated)
    expect(await reopenedDatabase.observations.get(observation.id)).toEqual(updated)

    await reopenedRepository.delete(observation.id)
    expect(await reopenedDatabase.observations.get(observation.id)).toBeUndefined()
  })

  it('rejects updating an observation that is not in the database', async () => {
    const repository = new DexieObservationRepository(createTestDatabase())

    await expect(repository.update(createTestObservation())).rejects.toThrow('does not exist')
  })

  it('persists demo completion status without implying remote synchronization', async () => {
    const repository = new DexieObservationRepository(createTestDatabase())
    const updated = await repository.markPendingAsSimulated()
    expect(updated).toHaveLength(2)
    expect((await repository.getAll()).filter((item) => item.syncStatus === 'Pending')).toHaveLength(0)
    expect((await repository.getAll()).filter((item) => item.syncStatus === 'Simulated')).toHaveLength(4)
  })
})
