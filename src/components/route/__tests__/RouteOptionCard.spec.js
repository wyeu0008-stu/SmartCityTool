import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import RouteOptionCard from '../RouteOptionCard.vue'

describe('RouteOptionCard', () => {
  const route = {
    name: 'Safest Route',
    badgeClass: 'green-badge',
    score: 9,
    scoreClass: 'green',
    time: '18 min',
    risk: 'Low',
    riskClass: 'low'
  }

  it('renders route information correctly', () => {
    const wrapper = mount(RouteOptionCard, {
      props: {
        route,
        active: false
      },
      global: {
        stubs: {
          BaseButton: {
            props: ['variant'],
            emits: ['click'],
            template: '<button @click="$emit(\'click\')"><slot /></button>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('Safest Route')
    expect(wrapper.text()).toContain('9')
    expect(wrapper.text()).toContain('18 min')
    expect(wrapper.text()).toContain('Low')
    expect(wrapper.text()).toContain('View Route')

    expect(wrapper.find('.mini-icon').classes()).toContain('green-badge')
    expect(wrapper.find('.score-box').classes()).toContain('green')
    expect(wrapper.find('.risk-text').classes()).toContain('low')
  })

  it('applies active class when active is true', () => {
    const wrapper = mount(RouteOptionCard, {
      props: {
        route,
        active: true
      },
      global: {
        stubs: {
          BaseButton: {
            props: ['variant'],
            emits: ['click'],
            template: '<button @click="$emit(\'click\')"><slot /></button>'
          }
        }
      }
    })

    expect(wrapper.find('.route-card').classes()).toContain('active')
  })

  it('emits view when button is clicked', async () => {
    const wrapper = mount(RouteOptionCard, {
      props: {
        route,
        active: false
      },
      global: {
        stubs: {
          BaseButton: {
            props: ['variant'],
            emits: ['click'],
            template: '<button @click="$emit(\'click\')"><slot /></button>'
          }
        }
      }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('view')).toBeTruthy()
    expect(wrapper.emitted('view')).toHaveLength(1)
  })
})