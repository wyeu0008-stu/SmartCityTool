import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MapPage from '../map/MapView.vue'

vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(() => ({ data: [] }))
  }
}))

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => ({
      setView: vi.fn().mockReturnThis(),
      on: vi.fn(),
      locate: vi.fn(),
      addLayer: vi.fn(),
      removeLayer: vi.fn(),
      invalidateSize: vi.fn()
    })),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    control: vi.fn(() => ({ addTo: vi.fn() })),
    DomUtil: {
      create: vi.fn(() => document.createElement('div'))
    },
    circleMarker: vi.fn(() => ({
      bindPopup: vi.fn().mockReturnThis(),
      openPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis()
    })),
    markerClusterGroup: vi.fn(() => ({
      addLayer: vi.fn()
    })),
    geoJSON: vi.fn(() => ({
      addTo: vi.fn()
    })),
    divIcon: vi.fn()
  }
}))

vi.mock('leaflet/dist/leaflet.css', () => ({}))
vi.mock('leaflet.markercluster', () => ({}))
vi.mock('leaflet.markercluster/dist/MarkerCluster.css', () => ({}))
vi.mock('leaflet.markercluster/dist/MarkerCluster.Default.css', () => ({}))

describe('MapPage', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.endsWith('.geojson')) {
        return Promise.resolve({
          json: () => Promise.resolve({ features: [] })
        })
      }
      if (url.endsWith('.csv')) {
        return Promise.resolve({
          text: () => Promise.resolve('LATITUDE,LONGITUDE')
        })
      }
    })

    global.alert = vi.fn()
  })

  it('renders correctly', () => {
    const wrapper = mount(MapPage)
    expect(wrapper.find('.map-page').exists()).toBe(true)
    expect(wrapper.findAll('.layer')).toHaveLength(3)
  })

  it('loads data on mount', async () => {
    mount(MapPage)
    await flushPromises()

    expect(global.fetch).toHaveBeenCalledWith('/bike_parking.geojson')
    expect(global.fetch).toHaveBeenCalledWith('/node.csv')
    expect(global.fetch).toHaveBeenCalledWith('/bike_line.geojson')
  })

  it('toggles layer on click', async () => {
    const wrapper = mount(MapPage)
    const layers = wrapper.findAll('.layer')

    await layers[0].trigger('click')
    expect(layers[0].classes()).toContain('active')
  })
})