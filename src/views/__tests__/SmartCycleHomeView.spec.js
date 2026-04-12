import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SmartCycleHomeView from '../SmartCycleHomeView.vue'

const mockUseRoutes = vi.fn()

vi.mock('../../composables/useRoutes', () => ({
  useRoutes: () => mockUseRoutes()
}))

describe('SmartCycleHomeView', () => {
  beforeEach(() => {
    mockUseRoutes.mockReturnValue({
      currentLocation: ref('Melbourne Central'),
      destination: ref('Federation Square'),
      routes: ref([]),
      loading: ref(false),
      error: ref(''),
      recommendedRoute: ref(null),
      selectedRoute: ref(null),
      selectedRouteId: ref(null),
      loadRoutes: vi.fn(),
      selectRoute: vi.fn()
    })
  })

  it('renders successfully', () => {
    const wrapper = mount(SmartCycleHomeView, {
      global: {
        stubs: {
          AppHeader: true,
          RouteSearchCard: true,
          RecommendedRouteCard: true,
          RouteCompareSection: true,
          RouteMapPanel: true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('shows error message when error exists', () => {
    mockUseRoutes.mockReturnValue({
      currentLocation: ref('Melbourne Central'),
      destination: ref('Federation Square'),
      routes: ref([]),
      loading: ref(false),
      error: ref('Something went wrong'),
      recommendedRoute: ref(null),
      selectedRoute: ref(null),
      selectedRouteId: ref(null),
      loadRoutes: vi.fn(),
      selectRoute: vi.fn()
    })

    const wrapper = mount(SmartCycleHomeView, {
      global: {
        stubs: {
          AppHeader: true,
          RouteSearchCard: true,
          RecommendedRouteCard: true,
          RouteCompareSection: true,
          RouteMapPanel: true
        }
      }
    })

    expect(wrapper.text()).toContain('Something went wrong')
  })
})