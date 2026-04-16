import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { describe, it, expect, vi } from 'vitest'
import SmartCycleHomeView from '../SmartCycleHomeView.vue'

vi.mock('../../composables/useRoutes', () => ({
  useRoutes: () => ({
    routes: ref([]),
    selectedRoute: ref({
      name: 'Safe Route A',
      score: 8.5
    }),
    selectedRouteId: ref(1),
    selectRoute: vi.fn()
  })
}))

describe('SmartCycleHomeView', () => {
  it('renders hero content correctly', () => {
    const wrapper = mount(SmartCycleHomeView, {
      global: {
        stubs: {
          AppHeader: {
            template: '<div data-test="app-header-stub"></div>'
          },
          RouteMapPanel: {
            template: '<div data-test="route-map-panel-stub"></div>'
          }
        }
      }
    })

    expect(wrapper.exists()).toBe(true)

    expect(wrapper.text()).toContain('SMART CYCLING SAFETY SYSTEM')
    expect(wrapper.text()).toContain('Cycle with')
    expect(wrapper.text()).toContain('Safety')
    expect(wrapper.text()).toContain(
      'A smart cycling safety and decision support system using open mobility data.'
    )

    expect(wrapper.find('[data-test="app-header-stub"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="route-map-panel-stub"]').exists()).toBe(true)
  })

  it('renders both action buttons', () => {
    const wrapper = mount(SmartCycleHomeView, {
      global: {
        stubs: {
          AppHeader: true,
          RouteMapPanel: true
        }
      }
    })

    const buttons = wrapper.findAll('button')

    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('Check Map')
    expect(buttons[1].text()).toBe('Plan My Route')
  })

  it('renders the hero image', () => {
    const wrapper = mount(SmartCycleHomeView, {
      global: {
        stubs: {
          AppHeader: true,
          RouteMapPanel: true
        }
      }
    })

    const image = wrapper.find('img')

    expect(image.exists()).toBe(true)
    expect(image.attributes('alt')).toBe('hero')
    expect(image.attributes('src')).toContain('tomi-vadasz-SBKJ47obEHY-unsplash.jpg')
  })
})