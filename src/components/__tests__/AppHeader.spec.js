import { mount } from '@vue/test-utils'
import AppHeader from '../layout/AppHeader.vue'

describe('AppHeader', () => {
  it('renders without crashing', () => {
    const wrapper = mount(AppHeader)
    expect(wrapper.exists()).toBe(true)
  })
})
