import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ReleaseHomePage from '../pages/ReleaseHomePage.vue'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push
  })
}))

describe('ReleaseHomePage', () => {
  it('renders planner hero and compare cards', () => {
    const wrapper = mount(ReleaseHomePage)

    expect(wrapper.text()).toContain('SmartCycle Navigator')
    expect(wrapper.text()).toContain('Find Safest Route')
    expect(wrapper.text()).toContain('Recommended Safest Route')
    expect(wrapper.findAll('.compare-card')).toHaveLength(3)
  })

  it('updates destination input and navigates to map on submit', async () => {
    const wrapper = mount(ReleaseHomePage)

    await wrapper.find('input[placeholder="Enter Destination"]').setValue('Docklands')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('input[placeholder="Enter Destination"]').element.value).toBe('Docklands')
    expect(push).toHaveBeenCalledWith('/map')
  })

  it('navigates to map when compare button is clicked', async () => {
    const wrapper = mount(ReleaseHomePage)

    await wrapper.find('.compare-button').trigger('click')

    expect(push).toHaveBeenCalledWith('/map')
  })
})
