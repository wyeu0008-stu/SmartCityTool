import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ReleaseInsightsPage from '../pages/ReleaseInsightsPage.vue'

describe('ReleaseInsightsPage', () => {
  it('renders insight cards and formatted date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-24T10:00:00Z'))

    const wrapper = mount(ReleaseInsightsPage)

    expect(wrapper.text()).toContain('Safety Insights')
    expect(wrapper.text()).toContain('Daily Cycling Conditions')
    expect(wrapper.text()).toContain('Weather Fit')
    expect(wrapper.text()).toContain('Traffic Risk')
    expect(wrapper.text()).toContain('Safer Window')
    expect(wrapper.findAll('article')).toHaveLength(3)

    vi.useRealTimers()
  })
})
