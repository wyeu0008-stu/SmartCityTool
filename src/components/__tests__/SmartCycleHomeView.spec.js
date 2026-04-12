import { mount } from '@vue/test-utils'
import SmartCycleHomeView from '../SmartCycleHomeView.vue'

describe('SmartCycleHomeView', () => {
  it('renders', () => {
    const wrapper = mount(SmartCycleHomeView)
    expect(wrapper.exists()).toBe(true)
  })
})