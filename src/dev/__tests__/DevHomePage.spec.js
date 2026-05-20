import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DevHomePage from '../pages/DevHomePage.vue'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/dev'
  }),
  useRouter: () => ({
    push
  })
}))

describe('DevHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          place_id: 123,
          name: 'Melbourne Central',
          display_name: 'Melbourne Central, Melbourne VIC, Australia',
          lat: '-37.8102',
          lon: '144.9628',
          address: {
            city: 'Melbourne',
            state: 'Victoria',
            country: 'Australia'
          }
        }
      ])
    }))
  })

  it('renders KnackCBD Ride branding and ride-planning content', () => {
    const wrapper = mount(DevHomePage)

    expect(wrapper.text()).toContain('KnackCBD Ride')
    expect(wrapper.text()).toContain('Plan A Safer Ride Around The City')
    expect(wrapper.text()).toContain('Ride planning support')
    expect(wrapper.text()).toContain('Popular Cycling Trips')
    expect(wrapper.findAll('.compare-card')).toHaveLength(3)
    expect(wrapper.text()).not.toContain('Compare All Routes')
  })

  it('opens map without defaulting to New Park when search is empty', async () => {
    const wrapper = mount(DevHomePage)

    await wrapper.find('form').trigger('submit.prevent')

    expect(push).toHaveBeenCalledWith('/dev/map')
  })

  it('passes typed destination and tourism route destinations to dev map', async () => {
    const wrapper = mount(DevHomePage)

    await wrapper.find('input[placeholder="Enter Destination"]').setValue('Docklands')
    await wrapper.find('form').trigger('submit.prevent')

    expect(push).toHaveBeenCalledWith({
      path: '/dev/map',
      query: {
        from: 'current-location',
        destination: 'Docklands',
        showRoute: 'true'
      }
    })

    await wrapper.find('.compare-card button').trigger('click')
    const routeCall = push.mock.calls.at(-1)[0]

    expect(routeCall.path).toBe('/dev/map')
    expect(routeCall.query.destination).toBeTruthy()
    expect(routeCall.query.destination).not.toBe('New Park')
  })

  it('shows API-backed destination suggestions only after typing', async () => {
    const wrapper = mount(DevHomePage)
    const input = wrapper.find('input[placeholder="Enter Destination"]')

    await input.trigger('focus')

    expect(wrapper.find('.home-suggestion-option').exists()).toBe(false)

    await input.setValue('mel')
    await new Promise((resolve) => window.setTimeout(resolve, 260))

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('bounded=1'))

    const suggestion = wrapper.find('.home-suggestion-option')

    expect(suggestion.exists()).toBe(true)
    expect(suggestion.text()).toContain('Melbourne Central')
    expect(suggestion.text()).toContain('Victoria')

    await suggestion.trigger('click')

    expect(input.element.value).toBe('Melbourne Central')
  })
})
