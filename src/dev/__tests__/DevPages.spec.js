import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DevHomePage from '../pages/DevHomePage.vue'
import DevMapPage from '../pages/DevMapPage.vue'
import DevInsightsPage from '../pages/DevInsightsPage.vue'

describe('Dev pages', () => {
  it('renders dev home page wrapper', () => {
    const wrapper = mount(DevHomePage, {
      global: {
        stubs: {
          DevPlannerHomeSection: {
            template: '<div data-test="dev-home-panel"></div>'
          }
        }
      }
    })

    expect(wrapper.find('[data-test="dev-home-panel"]').exists()).toBe(true)
  })

  it('renders dev map page wrapper', () => {
    const wrapper = mount(DevMapPage, {
      global: {
        stubs: {
          DevPlannerMapPanel: {
            template: '<div data-test="dev-map-panel"></div>'
          }
        }
      }
    })

    expect(wrapper.find('[data-test="dev-map-panel"]').exists()).toBe(true)
  })

  it('renders dev insights page wrapper', () => {
    const wrapper = mount(DevInsightsPage, {
      global: {
        stubs: {
          DevInsightsPanel: {
            template: '<div data-test="dev-insights-panel"></div>'
          }
        }
      }
    })

    expect(wrapper.find('[data-test="dev-insights-panel"]').exists()).toBe(true)
  })
})
