import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ReleaseMoreInfoPage from '../pages/ReleaseMoreInfoPage.vue'

describe('ReleaseMoreInfoPage', () => {
  it('renders synced more info rankings and dashboard content', () => {
    const wrapper = mount(ReleaseMoreInfoPage)

    expect(wrapper.find('[data-test="dev-more-info-panel"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Popular Origins')
    expect(wrapper.text()).toContain('Popular Destinations')
    expect(wrapper.text()).toContain('Top 3 Routes')
    expect(wrapper.text()).toContain('Cycling Data Dashboard')
  })
})
