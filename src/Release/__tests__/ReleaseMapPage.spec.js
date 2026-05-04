import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import L from 'leaflet'
import ReleaseMapPage from '../pages/ReleaseMapPage.vue'

let routeQuery = {}
const push = vi.fn()

const mockMap = {
  setView: vi.fn().mockReturnThis(),
  fitBounds: vi.fn().mockReturnThis(),
  flyTo: vi.fn(),
  invalidateSize: vi.fn(),
  removeLayer: vi.fn(),
  remove: vi.fn(),
  setMaxBounds: vi.fn(),
  once: vi.fn(),
  locate: vi.fn()
}
const mockTileLayer = { addTo: vi.fn() }
const mockZoomControl = { addTo: vi.fn() }
const mockLayer = {
  addTo: vi.fn().mockReturnThis(),
  bindTooltip: vi.fn().mockReturnThis(),
  bindPopup: vi.fn().mockReturnThis()
}
const bounds = {
  extend: vi.fn()
}

vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/map',
    query: routeQuery
  }),
  useRouter: () => ({
    push
  })
}))

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => mockMap),
    tileLayer: vi.fn(() => mockTileLayer),
    control: {
      zoom: vi.fn(() => mockZoomControl)
    },
    latLngBounds: vi.fn(() => bounds),
    rectangle: vi.fn(() => mockLayer),
    polyline: vi.fn(() => mockLayer),
    layerGroup: vi.fn(() => mockLayer),
    circle: vi.fn(() => mockLayer),
    circleMarker: vi.fn(() => mockLayer),
    marker: vi.fn(() => mockLayer),
    divIcon: vi.fn(() => ({})),
    geoJSON: vi.fn(() => mockLayer)
  }
}))

vi.mock('leaflet/dist/leaflet.css', () => ({}))

function mockFetchResponse(data) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data)
  })
}

describe('ReleaseMapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routeQuery = {}
    global.alert = vi.fn()
    global.fetch = vi.fn((url) => {
      if (String(url).includes('bike_line.geojson')) {
        return mockFetchResponse({
          features: [
            {
              type: 'Feature',
              properties: { highway: 'cycleway', cycleway: 'track', name: 'Protected test lane' },
              geometry: {
                type: 'LineString',
                coordinates: [[144.96, -37.81], [144.97, -37.812]]
              }
            }
          ]
        })
      }

      if (String(url).includes('router.project-osrm.org')) {
        return mockFetchResponse({
          routes: [
            {
              distance: 2100,
              duration: 720,
              geometry: {
                coordinates: [[144.9631, -37.8136], [144.9483, -37.8145]]
              }
            }
          ]
        })
      }

      return mockFetchResponse({ features: [], routes: [] })
    })
  })

  it('renders the synced map with Melbourne bounds and default route/bike-lane layers', async () => {
    const wrapper = mount(ReleaseMapPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Show Route')
    expect(wrapper.text()).toContain('Show Dedicated Bike Lanes')
    expect(L.map).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      maxBounds: bounds,
      maxBoundsViscosity: 1,
      minZoom: 14
    }))
    expect(L.tileLayer).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      bounds,
      noWrap: true
    }))
    expect(L.geoJSON).toHaveBeenCalled()
  })

  it('renders richer safety details for a release route query', async () => {
    routeQuery = {
      destination: 'Docklands',
      showRoute: 'true'
    }

    const wrapper = mount(ReleaseMapPage)
    await flushPromises()
    await flushPromises()

    await wrapper.find('.detail-toggle').trigger('click')

    expect(wrapper.text()).toContain('Safety analysis')
    expect(wrapper.text()).toContain('Low risk')
  })
})
