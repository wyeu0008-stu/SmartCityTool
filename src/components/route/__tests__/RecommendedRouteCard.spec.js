import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import RecommendedRouteCard from '../RecommendedRouteCard.vue'

describe('RecommendedRouteCard', () => {
  it('renders route details correctly when route data is provided', () => {
    const route = {
      routeType: 'Safest Route',
      alerts: [
        { text: 'Well-lit streets', symbol: '💡', level: 'yellow' },
        { text: 'Low traffic area', symbol: '🚗', level: 'red' }
      ],
      score: 8,
      time: '15 min',
      risk: 'Low'
    }

    const wrapper = mount(RecommendedRouteCard, {
      props: { route },
      global: {
        stubs: {
          BaseCard: {
            template: '<div><slot /></div>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('Recommended Safest Route')
    expect(wrapper.text()).toContain('Route Type: Safest Route')
    expect(wrapper.text()).toContain('Well-lit streets')
    expect(wrapper.text()).toContain('Low traffic area')
    expect(wrapper.text()).toContain('8')
    expect(wrapper.text()).toContain('15 min')
    expect(wrapper.text()).toContain('Low')

    const progressFill = wrapper.find('.progress-fill')
    expect(progressFill.exists()).toBe(true)
    expect(progressFill.attributes('style')).toContain('width: 80%')
  })

  it('renders fallback values when route is null', () => {
    const wrapper = mount(RecommendedRouteCard, {
      props: { route: null },
      global: {
        stubs: {
          BaseCard: {
            template: '<div><slot /></div>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('Route Type: -')
    expect(wrapper.text()).toContain('Safety Score')
    expect(wrapper.text()).toContain('/10')

    const progressFill = wrapper.find('.progress-fill')
    expect(progressFill.attributes('style')).toContain('width: 0%')

    const alerts = wrapper.findAll('.alert-list li')
    expect(alerts.length).toBe(0)
  })
})