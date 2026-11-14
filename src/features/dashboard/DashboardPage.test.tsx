import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import DashboardPage from './DashboardPage'
import observationsReducer from '../observations/observationsSlice'
import type { Observation, ObservationCoordinates } from '../observations/types'

type MockObservationMapProps = {
  observations: Observation[]
  onObservationSelect: (id: string) => void
  onLocationSelect: (coordinates: ObservationCoordinates) => void
}

vi.mock('../map/ObservationMap', () => ({
  default: ({ observations, onObservationSelect, onLocationSelect }: MockObservationMapProps) => (
    <div data-testid="mock-observation-map">
      {observations.map((observation) => <button key={observation.id} type="button" onClick={() => onObservationSelect(observation.id)}>Map marker {observation.title}</button>)}
      <button type="button" onClick={() => onLocationSelect({ latitude: 48.5, longitude: -123.5 })}>Choose map coordinates</button>
    </div>
  ),
}))

function renderDashboard() {
  const store = configureStore({ reducer: { observations: observationsReducer } })
  const user = userEvent.setup()
  render(<Provider store={store}><DashboardPage /></Provider>)
  return { store, user }
}

describe('dashboard observation management', () => {
  it('creates an observation and updates the table and summary', async () => {
    const { user } = renderDashboard()
    await user.click(screen.getByRole('button', { name: 'New observation' }))
    await user.type(screen.getByLabelText('Title'), 'Smoke at Mount Wells')
    await user.selectOptions(screen.getByLabelText('Observation category'), 'Smoke')
    await user.selectOptions(screen.getByLabelText('Observation severity'), 'High')
    await user.type(screen.getByLabelText('Description'), 'Visible smoke near the trailhead.')
    await user.type(screen.getByLabelText('Latitude'), '48.45')
    await user.type(screen.getByLabelText('Longitude'), '-123.4')
    await user.click(screen.getByRole('button', { name: 'Add observation' }))

    expect(screen.getByText('Smoke at Mount Wells')).toBeInTheDocument()
    expect(screen.getByLabelText('Total observations: 5')).toBeInTheDocument()
    expect(screen.getByText('48.4500, -123.4000')).toBeInTheDocument()
  })

  it('shows a validation message for an invalid coordinate', async () => {
    const { user } = renderDashboard()
    await user.click(screen.getByRole('button', { name: 'New observation' }))
    await user.type(screen.getByLabelText('Title'), 'Invalid coordinate report')
    await user.type(screen.getByLabelText('Description'), 'Coordinate outside allowed range.')
    await user.type(screen.getByLabelText('Latitude'), '91')
    await user.type(screen.getByLabelText('Longitude'), '-123')
    await user.click(screen.getByRole('button', { name: 'Add observation' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Latitude must be a number between -90 and 90.')
  })

  it('requires a title and description before saving', async () => {
    const { user } = renderDashboard()
    await user.click(screen.getByRole('button', { name: 'New observation' }))
    await user.click(screen.getByRole('button', { name: 'Add observation' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a title and description.')
    expect(screen.queryByText('No observations match these filters.')).not.toBeInTheDocument()
  })

  it('edits an existing observation from its row', async () => {
    const { user } = renderDashboard()
    await user.click(screen.getByRole('button', { name: 'Edit Smoke column observed' }))
    const title = screen.getByLabelText('Title')
    await user.clear(title)
    await user.type(title, 'Smoke column updated')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(screen.getByText('Smoke column updated')).toBeInTheDocument()
    expect(screen.queryByText('Smoke column observed')).not.toBeInTheDocument()
  })

  it('deletes an observation only after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderDashboard()
    await user.click(screen.getByRole('button', { name: 'Delete Smoke column observed' }))

    expect(window.confirm).toHaveBeenCalledOnce()
    expect(screen.queryByText('Smoke column observed')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Total observations: 3')).toBeInTheDocument()
  })

  it('filters rows and clears the selected filters', async () => {
    const { user } = renderDashboard()
    await user.selectOptions(screen.getByLabelText('Filter by category'), 'Fire')
    expect(screen.getByText('Unattended campfire')).toBeInTheDocument()
    expect(screen.queryByText('Smoke column observed')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Filter by severity'), 'Low')
    expect(screen.getByText('No observations match these filters.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(screen.getByText('Smoke column observed')).toBeInTheDocument()
    expect(screen.getByText('Unattended campfire')).toBeInTheDocument()
  })

  it('selects the corresponding observation when a map marker is clicked', async () => {
    const { user } = renderDashboard()
    await user.click(screen.getByRole('button', { name: 'Map marker Smoke column observed' }))

    expect(screen.getByText('Smoke column observed').closest('tr')).toHaveClass('selected-observation-row')
  })

  it('fills the create form with coordinates selected from the map', async () => {
    const { user } = renderDashboard()
    await user.click(screen.getByRole('button', { name: 'Choose map coordinates' }))
    await user.click(screen.getByRole('button', { name: 'New observation' }))

    expect(screen.getByLabelText('Latitude')).toHaveValue(48.5)
    expect(screen.getByLabelText('Longitude')).toHaveValue(-123.5)
    await user.type(screen.getByLabelText('Title'), 'Report from selected point')
    await user.type(screen.getByLabelText('Description'), 'Smoke visible from the map-selected location.')
    await user.click(screen.getByRole('button', { name: 'Add observation' }))

    expect(screen.getByText('48.5000, -123.5000')).toBeInTheDocument()
  })
})
