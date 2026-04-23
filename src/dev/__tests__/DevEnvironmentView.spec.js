import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DevEnvironmentView from '../DevEnvironmentView.vue'

describe('DevEnvironmentView', () => {
  it('renders the development prototype summary', () => {
    const wrapper = mount(DevEnvironmentView)

    expect(wrapper.text()).toContain('Development Environment')
    expect(wrapper.text()).toContain('Route Planner Function Prototype')
    expect(wrapper.text()).toContain('Planner Controls')
    expect(wrapper.text()).toContain('Recommended Route')
    expect(wrapper.text()).toContain('Map Plan JS Output')
  })

  it('switches mode and updates recommended route summary', async () => {
    const wrapper = mount(DevEnvironmentView)

    const buttons = wrapper.findAll('.segmented button')
    await buttons[1].trigger('click')

    expect(wrapper.text()).toContain('Fast Urban Link')
    expect(wrapper.text()).toContain('15 mins')
  })

  it('updates minimum score display and eligible routes', async () => {
    const wrapper = mount(DevEnvironmentView)

    const slider = wrapper.find('input[type="range"]')
    await slider.setValue('8')

    expect(wrapper.text()).toContain('8')
    expect(wrapper.text()).toContain('Protected Lane Route')
  })
})
