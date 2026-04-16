import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { vi, describe, it, expect } from 'vitest'
import SmartCycleHomeView from '../SmartCycleHomeView.vue'

vi.mock('../../composables/useRoutes', () => ({
  useRoutes: () => ({
    currentLocation: ref(''),
    destination: ref(''),
    routes: ref([]),
    loading: ref(false),
    error: ref('Something went wrong'),
    recommendedRoute: ref(null),
    selectedRoute: ref(null),
    selectedRouteId: ref(null),
    loadRoutes: vi.fn(),
    selectRoute: vi.fn()
  })
}))

describe('SmartCycleHomeView', () => {
  it('shows error message when error exists', () => {
    const wrapper = mount(SmartCycleHomeView)
    expect(wrapper.text()).toContain('Something went wrong')
  })
})