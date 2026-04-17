import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RouteMapPanel from '../src/components/map/RouteMapPanel.vue'

// mock BaseCard，Avoid relying on real UI components
vi.mock('../src/components/common/BaseCard.vue', () => ({
  default: {
    name: 'BaseCard',
    template: '<div class="base-card"><slot /></div>'
  }
}))

// ===== Leaflet mocks =====
const mapMock = {
  setView: vi.fn().mockReturnThis(),
  removeLayer: vi.fn()
}

const tileLayerMock = {
  addTo: vi.fn()
}

const polylineAddToMock = vi.fn()
const polylineMock = {
  addTo: polylineAddToMock
}

const circleMarkerBindPopupMock = vi.fn()
const circleMarkerAddToMock = vi.fn()

vi.mock('leaflet', () => {
  return {
    default: {
      map: vi.fn(() => mapMock),
      tileLayer: vi.fn(() => tileLayerMock),
      circleMarker: vi.fn(() => ({
        bindPopup: circleMarkerBindPopupMock.mockReturnValue({
          addTo: circleMarkerAddToMock
        })
      })),
      polyline: vi.fn(() => polylineMock)
    }
  }
})

vi.mock('leaflet/dist/leaflet.css', () => ({}))

describe('RouteMapPanel.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders map panel content correctly', () => {
    const wrapper = mount(RouteMapPanel)

    expect(wrapper.find('.map-panel').exists()).toBe(true)
    expect(wrapper.find('.map-layout').exists()).toBe(true)
    expect(wrapper.find('.real-map').exists()).toBe(true)

    expect(wrapper.text()).toContain('Live Risk Map Preview')
    expect(wrapper.text()).toContain('Accident 2')
    expect(wrapper.text()).toContain('Traffic 0')
    expect(wrapper.text()).toContain('No Lane 0')
    expect(wrapper.text()).toContain('Construction 1')
  })

  it('initializes leaflet map on mounted', async () => {
    const L = (await import('leaflet')).default

    mount(RouteMapPanel)
    await flushPromises()

    expect(L.map).toHaveBeenCalledWith('map')
    expect(mapMock.setView).toHaveBeenCalledWith([-37.8136, 144.9631], 13)
    expect(L.tileLayer).toHaveBeenCalled()
    expect(tileLayerMock.addTo).toHaveBeenCalledWith(mapMock)
  })

  it('renders all risk markers on mounted', async () => {
    const L = (await import('leaflet')).default

    mount(RouteMapPanel)
    await flushPromises()

    // 4 risks in component
    expect(L.circleMarker).toHaveBeenCalledTimes(4)
    expect(circleMarkerBindPopupMock).toHaveBeenCalledTimes(4)
    expect(circleMarkerAddToMock).toHaveBeenCalledTimes(4)

    expect(circleMarkerBindPopupMock).toHaveBeenCalledWith('Risk: accident')
    expect(circleMarkerBindPopupMock).toHaveBeenCalledWith('Risk: construction')
    expect(circleMarkerBindPopupMock).toHaveBeenCalledWith('Risk: safe')
  })

  it('uses correct colors for different risk types', async () => {
    const L = (await import('leaflet')).default

    mount(RouteMapPanel)
    await flushPromises()

    expect(L.circleMarker).toHaveBeenNthCalledWith(
      1,
      [-37.81, 144.96],
      expect.objectContaining({ color: 'red' })
    )

    expect(L.circleMarker).toHaveBeenNthCalledWith(
      2,
      [-37.82, 144.98],
      expect.objectContaining({ color: 'red' })
    )

    expect(L.circleMarker).toHaveBeenNthCalledWith(
      3,
      [-37.80, 144.95],
      expect.objectContaining({ color: 'orange' })
    )

    expect(L.circleMarker).toHaveBeenNthCalledWith(
      4,
      [-37.83, 144.97],
      expect.objectContaining({ color: 'green' })
    )
  })

  it('draws default route on mounted', async () => {
    const L = (await import('leaflet')).default

    mount(RouteMapPanel)
    await flushPromises()

    expect(L.polyline).toHaveBeenCalledTimes(1)
    expect(L.polyline).toHaveBeenCalledWith(
      [
        [-37.8136, 144.9631],
        [-37.8150, 144.9700],
        [-37.8200, 144.9750]
      ],
      {
        color: 'green',
        weight: 5
      }
    )

    expect(polylineAddToMock).toHaveBeenCalledWith(mapMock)
  })
})