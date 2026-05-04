import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ReleaseMapPage from '../pages/ReleaseMapPage.vue'
import L from 'leaflet'

const mockMap = {
  setView: vi.fn().mockReturnThis(),
  fitBounds: vi.fn(),
  flyTo: vi.fn(),
  removeLayer: vi.fn(),
  remove: vi.fn()
}

const mockTileLayer = {
  addTo: vi.fn()
}

const mockZoomControl = {
  addTo: vi.fn()
}

const mockPolyline = {
  addTo: vi.fn()
}

const mockLayerGroup = {
  addTo: vi.fn()
}

const mockMarker = {
  addTo: vi.fn().mockReturnThis(),
  bindTooltip: vi.fn().mockReturnThis()
}

const mockCircle = {
  bindTooltip: vi.fn().mockReturnThis()
}

const mockCircleMarker = {
  bindPopup: vi.fn().mockReturnThis()
}

const bounds = {
  extend: vi.fn()
}

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

describe('ReleaseMapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes leaflet map and renders planner controls', async () => {
    const wrapper = mount(ReleaseMapPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Current Location')
    expect(wrapper.text()).toContain('Map Layers')
    expect(wrapper.text()).toContain('Show Route')
    expect(wrapper.text()).toContain('Show Nearby Bike Parking')
    expect(L.map).toHaveBeenCalled()
    expect(L.tileLayer).toHaveBeenCalled()
    expect(mockZoomControl.addTo).toHaveBeenCalledWith(mockMap)
  })

  it('renders the collapsed map layer controls', async () => {
    const wrapper = mount(ReleaseMapPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Map Layers')
    expect(wrapper.text()).toContain('Show Route')
    expect(wrapper.text()).toContain('Show Nearby Toilets')
    expect(wrapper.text()).toContain('Show Nearby Water')
  })

  it('filters destinations in the search box', async () => {
    const wrapper = mount(ReleaseMapPage)
    await flushPromises()

    await wrapper.find('input[placeholder="Search location..."]').setValue('Dock')

    expect(wrapper.text()).toContain('Docklands')
  })

  it('toggles map layer checkboxes', async () => {
    const wrapper = mount(ReleaseMapPage)
    await flushPromises()

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes.length).toBeGreaterThan(0)

    await checkboxes[0].setValue(true)
    expect(checkboxes[0].element.checked).toBe(true)
  })
})
