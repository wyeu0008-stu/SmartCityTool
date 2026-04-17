import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RouteMapPanel from '../map/RouteMapPanel.vue'

// mock BaseCard
vi.mock('../common/BaseCard.vue', () => ({
  default: {
    name: 'BaseCard',
    template: '<div class="base-card"><slot /></div>'
  }
}))

const mapMock = {
  setView: vi.fn().mockReturnThis(),
  on: vi.fn(),
  getBounds: vi.fn(() => ({
    getSouth: () => -37.9,
    getNorth: () => -37.8,
    getWest: () => 144.9,
    getEast: () => 145.0
  }))
}

const tileLayerMock = {
  addTo: vi.fn()
}

const polylineBindPopupMock = vi.fn().mockReturnThis()
const polylineAddToMock = vi.fn().mockReturnThis()

vi.mock('leaflet', () => {
  return {
    default: {
      map: vi.fn(() => mapMock),
      tileLayer: vi.fn(() => tileLayerMock),
      polyline: vi.fn(() => ({
        bindPopup: polylineBindPopupMock,
        addTo: polylineAddToMock
      }))
    }
  }
})

vi.mock('leaflet/dist/leaflet.css', () => ({}))

describe('RouteMapPanel.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            flowSegmentData: {
              currentSpeed: 20,
              freeFlowSpeed: 60,
              coordinates: {
                coordinate: [
                  { latitude: -37.81, longitude: 144.96 },
                  { latitude: -37.82, longitude: 144.97 }
                ]
              }
            }
          })
      })
    )
  })

  it('renders title and map container correctly', () => {
    const wrapper = mount(RouteMapPanel)

    expect(wrapper.find('.map-panel').exists()).toBe(true)
    expect(wrapper.find('.map-layout').exists()).toBe(true)
    expect(wrapper.find('.real-map').exists()).toBe(true)
    expect(wrapper.text()).toContain('Live Traffic Map Preview')
  })

  it('initializes map on mounted', async () => {
    const L = (await import('leaflet')).default

    mount(RouteMapPanel)
    await flushPromises()

    expect(L.map).toHaveBeenCalledWith('map')
    expect(mapMock.setView).toHaveBeenCalledWith([-37.8136, 144.9631], 13)
    expect(L.tileLayer).toHaveBeenCalled()
    expect(tileLayerMock.addTo).toHaveBeenCalledWith(mapMock)
  })

  it('updates current time on mounted', async () => {
    const wrapper = mount(RouteMapPanel)
    await flushPromises()

    expect(wrapper.find('.map-time').text()).toContain('UPDATED')
    expect(wrapper.find('.map-time').text()).not.toBe('UPDATED  ↗')
  })

  it('loads traffic data on mounted', async () => {
    mount(RouteMapPanel)
    await flushPromises()

    expect(global.fetch).toHaveBeenCalled()
    expect(global.fetch.mock.calls[0][0]).toContain('api.tomtom.com/traffic/services/4/flowSegmentData')
  })

  it('draws red traffic polyline for heavy congestion', async () => {
    const L = (await import('leaflet')).default

    mount(RouteMapPanel)
    await flushPromises()

    expect(L.polyline).toHaveBeenCalled()

    const polylineArgs = L.polyline.mock.calls[0]
    expect(polylineArgs[0]).toEqual([
      [-37.81, 144.96],
      [-37.82, 144.97]
    ])
    expect(polylineArgs[1]).toEqual(
      expect.objectContaining({
        color: '#cc0000',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round'
      })
    )

    expect(polylineBindPopupMock).toHaveBeenCalledWith('Speed: 20 km/h')
    expect(polylineAddToMock).toHaveBeenCalledWith(mapMock)
  })

  it('registers moveend listener to reload traffic grid', async () => {
    mount(RouteMapPanel)
    await flushPromises()

    expect(mapMock.on).toHaveBeenCalledWith('moveend', expect.any(Function))
  })

  it('reloads traffic data when moveend is triggered', async () => {
    mount(RouteMapPanel)
    await flushPromises()

    const moveendHandler = mapMock.on.mock.calls.find(
      ([eventName]) => eventName === 'moveend'
    )?.[1]

    expect(moveendHandler).toBeTypeOf('function')

    global.fetch.mockClear()

    moveendHandler()
    await flushPromises()

    expect(global.fetch).toHaveBeenCalled()
  })

  it('does not draw polyline when traffic is low', async () => {
    const L = (await import('leaflet')).default

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            flowSegmentData: {
              currentSpeed: 55,
              freeFlowSpeed: 60,
              coordinates: {
                coordinate: [
                  { latitude: -37.81, longitude: 144.96 },
                  { latitude: -37.82, longitude: 144.97 }
                ]
              }
            }
          })
      })
    )

    mount(RouteMapPanel)
    await flushPromises()

    expect(L.polyline).not.toHaveBeenCalled()
  })

  it('draws orange traffic polyline for medium congestion', async () => {
    const L = (await import('leaflet')).default

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            flowSegmentData: {
              currentSpeed: 40,
              freeFlowSpeed: 60,
              coordinates: {
                coordinate: [
                  { latitude: -37.81, longitude: 144.96 },
                  { latitude: -37.82, longitude: 144.97 }
                ]
              }
            }
          })
      })
    )

    mount(RouteMapPanel)
    await flushPromises()

    expect(L.polyline).toHaveBeenCalled()
    expect(L.polyline.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        color: '#ff8c00'
      })
    )
  })

  it('handles missing flow data gracefully', async () => {
    const L = (await import('leaflet')).default

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            flowSegmentData: null
          })
      })
    )

    mount(RouteMapPanel)
    await flushPromises()

    expect(L.polyline).not.toHaveBeenCalled()
  })
})