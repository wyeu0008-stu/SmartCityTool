import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TodayOverviewCard from '../safety/TodayOverviewCard.vue'

describe('TodayOverviewCard.vue', () => {
  it('renders title and date text correctly', () => {
    const wrapper = mount(TodayOverviewCard, {
      props: {
        dateText: '16 Apr 2026',
        weather: {
          temperature: 22,
          windSpeed: 15,
          description: 'Sunny'
        }
      }
    })

    expect(wrapper.text()).toContain("Today’s Safety Snapshot")
    expect(wrapper.find('.date').text()).toBe('16 Apr 2026')
  })

  it('shows loading state', () => {
    const wrapper = mount(TodayOverviewCard, {
      props: {
        loading: true
      }
    })

    expect(wrapper.find('.status-text').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading weather...')
    expect(wrapper.find('.weather-grid').exists()).toBe(false)
  })

  it('shows error state', () => {
    const wrapper = mount(TodayOverviewCard, {
      props: {
        error: 'Failed to load weather'
      }
    })

    expect(wrapper.find('.status-text.error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to load weather')
    expect(wrapper.find('.weather-grid').exists()).toBe(false)
  })

  it('renders weather values correctly', () => {
    const wrapper = mount(TodayOverviewCard, {
      props: {
        weather: {
          temperature: 24,
          windSpeed: 18,
          description: 'Cloudy'
        }
      }
    })

    const values = wrapper.findAll('.value').map(node => node.text())

    expect(wrapper.find('.weather-grid').exists()).toBe(true)
    expect(values).toContain('24°C')
    expect(values).toContain('18 km/h')
    expect(values).toContain('Cloudy')
  })

  it('renders fallback values when weather fields are missing', () => {
    const wrapper = mount(TodayOverviewCard, {
      props: {
        weather: {}
      }
    })

    const values = wrapper.findAll('.value').map(node => node.text())

    expect(values).toContain('--°C')
    expect(values).toContain('-- km/h')
    expect(values).toContain('--')
  })

  it('prefers loading state over error state', () => {
    const wrapper = mount(TodayOverviewCard, {
      props: {
        loading: true,
        error: 'Something went wrong'
      }
    })

    expect(wrapper.text()).toContain('Loading weather...')
    expect(wrapper.text()).not.toContain('Something went wrong')
  })

  it('shows weather grid when not loading and no error', () => {
    const wrapper = mount(TodayOverviewCard, {
      props: {
        loading: false,
        error: '',
        weather: {
          temperature: 20,
          windSpeed: 10,
          description: 'Clear'
        }
      }
    })

    expect(wrapper.find('.weather-grid').exists()).toBe(true)
    expect(wrapper.findAll('.weather-item')).toHaveLength(3)
  })
})