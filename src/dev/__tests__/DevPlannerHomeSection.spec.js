import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DevPlannerHomeSection from '../components/DevPlannerHomeSection.vue'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push
  })
}))

describe('DevPlannerHomeSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders preview planner content', () => {
    const wrapper = mount(DevPlannerHomeSection)

    expect(wrapper.text()).toContain('SmartCycle Navigator')
    expect(wrapper.text()).toContain('Pre-release testing environment')
    expect(wrapper.text()).toContain('Recommended Preview Route')
    expect(wrapper.findAll('.compare-card')).toHaveLength(3)
  })

  it('updates destination and navigates to dev map on submit', async () => {
    const wrapper = mount(DevPlannerHomeSection)

    await wrapper.find('input[placeholder="Enter Destination"]').setValue('Docklands')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('input[placeholder="Enter Destination"]').element.value).toBe('Docklands')
    expect(push).toHaveBeenCalledWith('/dev/map')
  })

  it('navigates to dev map from action buttons', async () => {
    const wrapper = mount(DevPlannerHomeSection)

    await wrapper.find('.route-stats button').trigger('click')
    await wrapper.findAll('.compare-card button')[0].trigger('click')

    expect(push).toHaveBeenCalledWith('/dev/map')
    expect(push).toHaveBeenCalledTimes(2)
  })
})
