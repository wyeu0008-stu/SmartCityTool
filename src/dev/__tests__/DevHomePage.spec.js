import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DevHomePage from '../pages/DevHomePage.vue'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push
  })
}))

describe('DevHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Knackeredlad branding and safety-analysis content', () => {
    const wrapper = mount(DevHomePage)

    expect(wrapper.text()).toContain('knackeredlad SmartCycle Navigator')
    expect(wrapper.text()).toContain('How SmartCycle Analyses Safety')
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
})
