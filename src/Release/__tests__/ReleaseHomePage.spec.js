import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ReleaseHomePage from '../pages/ReleaseHomePage.vue'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/'
  }),
  useRouter: () => ({
    push
  })
}))

describe('ReleaseHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders synced planner hero, safety analysis, and tourism cards', () => {
    const wrapper = mount(ReleaseHomePage)

    expect(wrapper.text()).toContain('knackeredlad SmartCycle Navigator')
    expect(wrapper.text()).toContain('How SmartCycle Analyses Safety')
    expect(wrapper.text()).toContain('Popular Cycling Trips')
    expect(wrapper.findAll('.compare-card')).toHaveLength(3)
    expect(wrapper.text()).not.toContain('Compare All Routes')
  })

  it('opens release map without defaulting to New Park when search is empty', async () => {
    const wrapper = mount(ReleaseHomePage)

    await wrapper.find('form').trigger('submit.prevent')

    expect(push).toHaveBeenCalledWith('/map')
  })

  it('passes typed and tourism destinations to the release map', async () => {
    const wrapper = mount(ReleaseHomePage)

    await wrapper.find('input[placeholder="Enter Destination"]').setValue('Docklands')
    await wrapper.find('form').trigger('submit.prevent')

    expect(push).toHaveBeenCalledWith({
      path: '/map',
      query: {
        from: 'current-location',
        destination: 'Docklands',
        showRoute: 'true'
      }
    })

    await wrapper.find('.compare-card button').trigger('click')
    const routeCall = push.mock.calls.at(-1)[0]

    expect(routeCall.path).toBe('/map')
    expect(routeCall.query.destination).toBeTruthy()
    expect(routeCall.query.destination).not.toBe('New Park')
  })
})
