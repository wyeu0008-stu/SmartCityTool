import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ReleaseInsightsPage from '../pages/ReleaseInsightsPage.vue'

vi.mock('../../services/tipsService', () => ({
  fetchCyclingTips: vi.fn().mockResolvedValue([
    {
      title: 'Start Small',
      text: 'Even a short ride through Melbourne CBD can help build confidence and improve daily fitness.',
      category: 'motivation'
    },
    {
      title: 'Choose Bike Lanes',
      text: 'Use marked bike lanes where possible to make your journey safer and more comfortable.',
      category: 'safety'
    },
    {
      title: 'Avoid Peak Stress',
      text: 'Try riding during quieter hours to enjoy a smoother and less stressful trip.',
      category: 'planning'
    }
  ])
}))

describe('ReleaseInsightsPage', () => {
  it('renders insight cards and formatted date', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-24T10:00:00Z'))

    const wrapper = mount(ReleaseInsightsPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Safety Insights')
    expect(wrapper.text()).toContain('Daily Cycling Conditions')
    expect(wrapper.text()).toContain('Weather Fit')
    expect(wrapper.text()).toContain('Traffic Risk')
    expect(wrapper.text()).toContain('Safer Window')

    expect(wrapper.findAll('.condition-card')).toHaveLength(3)
    expect(wrapper.findAll('.tip-card')).toHaveLength(3)

    expect(wrapper.text()).toContain('Positive Cycling Tips')
    expect(wrapper.text()).toContain('Refresh Tips')

    vi.useRealTimers()
  })
})
