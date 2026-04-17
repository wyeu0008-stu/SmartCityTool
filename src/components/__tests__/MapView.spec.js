import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import MapView from '../map/MapView.vue'
import Papa from 'papaparse'
import L from 'leaflet'

vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn()
  }
}))

const eventHandlers = {}

const mockMap = {
  setView: vi.fn().mockReturnThis(),
  on: vi.fn((event, cb) => {
    eventHandlers[event] = cb
    return mockMap
  }),
  locate: vi.fn(),
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  invalidateSize: vi.fn()
}

const mockTileLayer = {
  addTo: vi.fn()
}

const mockLocateControl = {
  onAdd: null,
  addTo: vi.fn()
}

const mockClusterGroup = {
  addLayer: vi.fn()
}

const mockGeoJsonLayer = {
  addTo: vi.fn()
}

const mockCircleMarker = {
  bindPopup: vi.fn().mockReturnThis(),
  openPopup: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis()
}

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => mockMap),
    tileLayer: vi.fn(() => mockTileLayer),
    control: vi.fn(() => mockLocateControl),
    DomUtil: {
      create: vi.fn(() => document.createElement('div'))
    },
    circleMarker: vi.fn(() => mockCircleMarker),
    markerClusterGroup: vi.fn(() => mockClusterGroup),
    geoJSON: vi.fn(() => mockGeoJsonLayer),
    divIcon: vi.fn(() => ({}))
  }
}))

vi.mock('leaflet/dist/leaflet.css', () => ({}))
vi.mock('leaflet.markercluster', () => ({}))
vi.mock('leaflet.markercluster/dist/MarkerCluster.css', () => ({}))
vi.mock('leaflet.markercluster/dist/MarkerCluster.Default.css', () => ({}))

describe('MapView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    Object.keys(eventHandlers).forEach((key) => delete eventHandlers[key])

    Papa.parse.mockReturnValue({
      data: [
        { LATITUDE: '-37.81', LONGITUDE: '144.96' },
        { LATITUDE: '-37.82', LONGITUDE: '144.97' },
        { LATITUDE: '', LONGITUDE: '144.98' }
      ]
    })

    global.fetch = vi.fn((url) => {
      if (url === '/bike_parking.geojson') {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              features: [
                {
                  geometry: {
                    coordinates: [144.96, -37.81]
                  },
                  properties: {
                    amenity: 'Bike Parking'
                  }
                }
              ]
            })
        })
      }

      if (url === '/node.csv') {
        return Promise.resolve({
          text: () => Promise.resolve('LATITUDE,LONGITUDE\n-37.81,144.96')
        })
      }

      if (url === '/bike_line.geojson') {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              features: [
                {
                  geometry: { type: 'LineString' },
                  properties: {
                    highway: 'cycleway',
                    access: 'yes'
                  }
                },
                {
                  geometry: { type: 'LineString' },
                  properties: {
                    highway: 'road',
                    access: 'yes'
                  }
                }
              ]
            })
        })
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`))
    })

    global.alert = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders sidebar and all filter layers', () => {
    const wrapper = mount(MapView)

    expect(wrapper.find('.map-page').exists()).toBe(true)
    expect(wrapper.find('.sidebar').exists()).toBe(true)
    expect(wrapper.find('#map').exists()).toBe(true)
    expect(wrapper.findAll('.layer')).toHaveLength(3)
    expect(wrapper.text()).toContain('Map Filters')
  })

  it('shows bike parking as active by default', () => {
    const wrapper = mount(MapView)
    const layers = wrapper.findAll('.layer')

    expect(layers[1].classes()).toContain('active')
  })

  it('initializes leaflet map and tile layer on mount', async () => {
    mount(MapView)
    await flushPromises()

    expect(L.map).toHaveBeenCalledWith('map')
    expect(mockMap.setView).toHaveBeenCalledWith([-37.8136, 144.9631], 11)
    expect(L.tileLayer).toHaveBeenCalled()
    expect(mockTileLayer.addTo).toHaveBeenCalledWith(mockMap)
  })

  it('loads all three data sources on mount', async () => {
    mount(MapView)
    await flushPromises()

    expect(global.fetch).toHaveBeenCalledWith('/bike_parking.geojson')
    expect(global.fetch).toHaveBeenCalledWith('/node.csv')
    expect(global.fetch).toHaveBeenCalledWith('/bike_line.geojson')
  })

  it('parses accident csv and creates accident markers', async () => {
    mount(MapView)
    await flushPromises()

    expect(Papa.parse).toHaveBeenCalled()
    expect(L.circleMarker).toHaveBeenCalled()
    expect(mockClusterGroup.addLayer).toHaveBeenCalled()
  })

  it('creates bike lane geojson layer from filtered features', async () => {
    mount(MapView)
    await flushPromises()

    expect(L.geoJSON).toHaveBeenCalledTimes(1)

    const geoJsonArg = L.geoJSON.mock.calls[0][0]
    expect(geoJsonArg).toHaveLength(1)
    expect(mockGeoJsonLayer.addTo).not.toHaveBeenCalled()
  })

  it('toggles accident layer on', async () => {
    const wrapper = mount(MapView)
    await flushPromises()

    const layers = wrapper.findAll('.layer')
    await layers[0].trigger('click')
    await flushPromises()

    expect(layers[0].classes()).toContain('active')
    expect(global.fetch).toHaveBeenCalledWith('/node.csv')
  })

  it('toggles bike lane layer on and adds it to map', async () => {
    const wrapper = mount(MapView)
    await flushPromises()

    const layers = wrapper.findAll('.layer')
    await layers[2].trigger('click')
    await flushPromises()

    expect(layers[2].classes()).toContain('active')
    expect(global.fetch).toHaveBeenCalledWith('/bike_line.geojson')
  })

  it('toggles bike parking layer off and removes cluster layer', async () => {
    const wrapper = mount(MapView)
    await flushPromises()

    const layers = wrapper.findAll('.layer')
    await layers[1].trigger('click')

    expect(layers[1].classes()).not.toContain('active')
    expect(mockMap.removeLayer).toHaveBeenCalled()
  })

  it('registers locationfound and locationerror handlers', async () => {
    mount(MapView)
    await flushPromises()

    expect(mockMap.on).toHaveBeenCalledWith('locationfound', expect.any(Function))
    expect(mockMap.on).toHaveBeenCalledWith('locationerror', expect.any(Function))
  })

  it('handles locationfound event and shows user marker', async () => {
    mount(MapView)
    await flushPromises()

    eventHandlers.locationfound({
      latlng: { lat: -37.81, lng: 144.96 }
    })

    expect(L.circleMarker).toHaveBeenCalled()
    expect(mockCircleMarker.addTo).toHaveBeenCalledWith(mockMap)
    expect(mockCircleMarker.bindPopup).toHaveBeenCalledWith('You are here')
    expect(mockCircleMarker.openPopup).toHaveBeenCalled()
  })

  it('handles locationerror event', async () => {
    mount(MapView)
    await flushPromises()

    eventHandlers.locationerror()

    expect(global.alert).toHaveBeenCalledWith('Unable to get your location')
  })

  it('creates locate control and triggers map.locate when clicked', async () => {
    mount(MapView)
    await flushPromises()

    expect(L.control).toHaveBeenCalledWith({ position: 'topleft' })
    expect(mockLocateControl.addTo).toHaveBeenCalledWith(mockMap)

    const controlElement = mockLocateControl.onAdd()
    controlElement.onclick()

    expect(mockMap.locate).toHaveBeenCalledWith({ setView: true, maxZoom: 16 })
  })

  it('calls invalidateSize after timeout', async () => {
    mount(MapView)
    await flushPromises()

    vi.advanceTimersByTime(300)

    expect(mockMap.invalidateSize).toHaveBeenCalled()
  })
})