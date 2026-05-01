import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import DevInsightsPanel from '../components/DevInsightsPanel.vue'

describe('DevInsightsPanel', () => {
  it('renders preview insight cards and date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-28T09:00:00Z'))

    const wrapper = mount(DevInsightsPanel)

    expect(wrapper.text()).toContain('Safety Insights')
    expect(wrapper.text()).toContain('Daily Cycling Conditions')
    expect(wrapper.text()).toContain('Release Status')
    expect(wrapper.findAll('article')).toHaveLength(3)

    vi.useRealTimers()
  })
})
