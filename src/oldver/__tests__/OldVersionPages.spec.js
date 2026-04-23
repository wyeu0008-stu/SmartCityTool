import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OldVersionHomePage from '../pages/OldVersionHomePage.vue'
import OldVersionMapPage from '../pages/OldVersionMapPage.vue'
import OldVersionInsightsPage from '../pages/OldVersionInsightsPage.vue'

describe('OldVersion wrapper pages', () => {
  it('renders old version home wrapper', () => {
    const wrapper = mount(OldVersionHomePage, {
      global: {
        stubs: {
          SmartCycleHomeView: {
            template: '<div data-test="old-home"></div>'
          }
        }
      }
    })

    expect(wrapper.find('[data-test="old-home"]').exists()).toBe(true)
  })

  it('renders old version map wrapper', () => {
    const wrapper = mount(OldVersionMapPage, {
      global: {
        stubs: {
          MapView: {
            template: '<div data-test="old-map"></div>'
          }
        }
      }
    })

    expect(wrapper.find('[data-test="old-map"]').exists()).toBe(true)
  })

  it('renders old version insights wrapper', () => {
    const wrapper = mount(OldVersionInsightsPage, {
      global: {
        stubs: {
          SafetyInsightsView: {
            template: '<div data-test="old-insights"></div>'
          }
        }
      }
    })

    expect(wrapper.find('[data-test="old-insights"]').exists()).toBe(true)
  })
})
