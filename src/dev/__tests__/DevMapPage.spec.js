import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import L from 'leaflet'
import DevMapPage from '../pages/DevMapPage.vue'

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

describe('DevMapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routeQuery = {}
    global.alert = vi.fn()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
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

  it('limits the map to Melbourne bounds and enables route and bike lane layers by default', async () => {
    const wrapper = mount(DevMapPage)
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

  it('shows richer safety details for a searched route', async () => {
    routeQuery = {
      destination: 'Docklands',
      showRoute: 'true'
    }

    const wrapper = mount(DevMapPage)
    await flushPromises()
    await flushPromises()

    await wrapper.find('.detail-toggle').trigger('click')

    expect(wrapper.text()).toContain('Safety analysis')
    expect(wrapper.text()).toContain('Low risk')
    expect(wrapper.text()).toContain('Protected-lane preference')
  })

  it('shows start point suggestions and selects an origin', async () => {
    const wrapper = mount(DevMapPage)
    await flushPromises()

    const originInput = wrapper.find('input[placeholder="Start point"]')
    await originInput.trigger('focus')
    await originInput.setValue('Docklands')

    const docklandsButton = wrapper.findAll('.suggestion-list .suggestion-option').find((button) =>
      button.text().includes('Docklands')
    )

    expect(docklandsButton).toBeTruthy()

    await docklandsButton.trigger('click')

    expect(originInput.element.value).toBe('Docklands')
  })

  it('uses backend model route data and sends route warnings only to console', async () => {
    routeQuery = {
      destination: 'Docklands',
      showRoute: 'true'
    }

    global.fetch = vi.fn((url) => {
      const requestUrl = String(url)

      if (requestUrl.includes('bike_line.geojson')) {
        return mockFetchResponse({ features: [] })
      }

      if (requestUrl.includes('/api/routes/compare')) {
        return mockFetchResponse({
          warnings: [
            'Route 1 has 2 route segment id(s) that do not match city_road_segments_stage.'
          ],
          routes: [
            {
              route_id: 1,
              route_type: 'safest',
              total_distance_m: 14200,
              estimated_duration_min: 48,
              safety_score: 63.85,
              explanation: 'Model safety score 63.85/100 based on matched route segment features.',
              path_coordinates: [
                { lat: -37.8136, lng: 144.9631 },
                { lat: -37.8145, lng: 144.9483 }
              ],
              partial_segment_geometry: false
            },
            {
              route_id: 2,
              route_type: 'fastest',
              total_distance_m: 12500,
              estimated_duration_min: 38,
              safety_score: 62.66,
              explanation: 'Model safety score 62.66/100 based on matched route segment features.',
              path_coordinates: [
                { lat: -37.8136, lng: 144.9631 },
                { lat: -37.812, lng: 144.955 }
              ],
              partial_segment_geometry: false
            },
            {
              route_id: 3,
              route_type: 'balanced',
              total_distance_m: 13300,
              estimated_duration_min: 42,
              safety_score: 47.89,
              explanation: 'Model safety score 47.89/100 based on matched route segment features.',
              path_coordinates: [
                { lat: -37.8136, lng: 144.9631 },
                { lat: -37.818, lng: 144.951 }
              ],
              partial_segment_geometry: true
            }
          ]
        })
      }

      if (requestUrl.includes('router.project-osrm.org')) {
        return mockFetchResponse({
          routes: [
            {
              distance: 3000,
              duration: 900,
              geometry: {
                coordinates: [[144.9631, -37.8136], [144.9689, -37.8226]]
              }
            }
          ]
        })
      }

      return mockFetchResponse({ features: [], routes: [] })
    })

    const wrapper = mount(DevMapPage)
    await flushPromises()
    await flushPromises()

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/routes/compare'),
      expect.objectContaining({
        method: 'POST'
      })
    )
    expect(wrapper.text()).toContain('6.4')
    expect(wrapper.text()).toContain('12 mins')
    expect(wrapper.text()).toContain('3.0 km')
    expect(wrapper.text()).toContain('Model safety score 63.85/100')
    expect(wrapper.text()).not.toContain('do not match city_road_segments_stage')
    expect(console.warn).toHaveBeenCalledWith(
      '[SmartCycle route]',
      'Route 1 has 2 route segment id(s) that do not match city_road_segments_stage.'
    )

    await wrapper.find('.detail-toggle').trigger('click')

    expect(wrapper.text()).toContain('3 available route options')
    expect(wrapper.text()).toContain('Shortest')
  })
})
