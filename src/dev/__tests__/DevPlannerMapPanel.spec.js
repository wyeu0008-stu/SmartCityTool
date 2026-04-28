import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DevPlannerMapPanel from '../components/DevPlannerMapPanel.vue'
import L from 'leaflet'

const mockMap = {
  setView: vi.fn().mockReturnThis(),
  fitBounds: vi.fn(),
  flyTo: vi.fn(),
  removeLayer: vi.fn(),
  remove: vi.fn()
}

const mockTileLayer = { addTo: vi.fn() }
const mockZoomControl = { addTo: vi.fn() }
const mockPolyline = { addTo: vi.fn() }
const mockLayerGroup = { addTo: vi.fn() }
const mockMarker = {
  addTo: vi.fn().mockReturnThis(),
  bindTooltip: vi.fn().mockReturnThis()
}
const mockCircle = { bindTooltip: vi.fn().mockReturnThis() }
const mockCircleMarker = { bindPopup: vi.fn().mockReturnThis() }
const bounds = { extend: vi.fn() }

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => mockMap),
    tileLayer: vi.fn(() => mockTileLayer),
    control: {
      zoom: vi.fn(() => mockZoomControl)
    },
    polyline: vi.fn(() => mockPolyline),
    layerGroup: vi.fn(() => mockLayerGroup),
    circle: vi.fn(() => mockCircle),
    circleMarker: vi.fn(() => mockCircleMarker),
    marker: vi.fn(() => mockMarker),
    divIcon: vi.fn(() => ({})),
    latLngBounds: vi.fn(() => bounds)
  }
}))

vi.mock('leaflet/dist/leaflet.css', () => ({}))

describe('DevPlannerMapPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes leaflet map and renders preview planner controls', async () => {
    const wrapper = mount(DevPlannerMapPanel)
    await flushPromises()

    expect(wrapper.text()).toContain('Current Location')
    expect(wrapper.text()).toContain('Show Safe Routes')
    expect(wrapper.text()).toContain('Popular Routes')
    expect(L.map).toHaveBeenCalled()
    expect(L.tileLayer).toHaveBeenCalled()
    expect(mockZoomControl.addTo).toHaveBeenCalledWith(mockMap)
  })

  it('switches route mode and updates summary', async () => {
    const wrapper = mount(DevPlannerMapPanel)
    await flushPromises()

    await wrapper.findAll('.mode-tabs button')[1].trigger('click')

    expect(wrapper.text()).toContain('Mixed Road Access')
    expect(wrapper.text()).toContain('15 mins')
  })

  it('filters destinations and chooses a destination', async () => {
    const wrapper = mount(DevPlannerMapPanel)
    await flushPromises()

    await wrapper.find('input[placeholder="Search location..."]').setValue('Dock')
    expect(wrapper.text()).toContain('Docklands')

    const destinationButton = wrapper.findAll('.destination-option').find((node) =>
      node.text().includes('Docklands')
    )
    await destinationButton.trigger('click')

    expect(mockMap.flyTo).toHaveBeenCalled()
    expect(wrapper.text()).toContain('to Docklands')
  })

  it('toggles a map layer off', async () => {
    const wrapper = mount(DevPlannerMapPanel)
    await flushPromises()

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    await checkboxes[1].setValue(false)

    expect(mockMap.removeLayer).toHaveBeenCalled()
  })
})
