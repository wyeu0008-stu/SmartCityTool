import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import RouteSearchCard from '../RouteSearchCard.vue'

describe('RouteSearchCard', () => {
  it('renders input values and submit button text', () => {
    const wrapper = mount(RouteSearchCard, {
      props: {
        currentLocation: 'Melbourne Central',
        destination: 'Federation Square',
        loading: false
      },
      global: {
        stubs: {
          BaseCard: {
            template: '<div><slot /></div>'
          },
          BaseButton: {
            props: ['disabled', 'variant'],
            template: '<button :disabled="disabled"><slot /></button>'
          }
        }
      }
    })

    const inputs = wrapper.findAll('input')
    expect(inputs).toHaveLength(2)
    expect(inputs[0].element.value).toBe('Melbourne Central')
    expect(inputs[1].element.value).toBe('Federation Square')
    expect(wrapper.text()).toContain('Find Safest Route')
  })

  it('emits updated current location and destination', async () => {
    const wrapper = mount(RouteSearchCard, {
      props: {
        currentLocation: '',
        destination: '',
        loading: false
      },
      global: {
        stubs: {
          BaseCard: {
            template: '<div><slot /></div>'
          },
          BaseButton: {
            props: ['disabled', 'variant'],
            template: '<button :disabled="disabled"><slot /></button>'
          }
        }
      }
    })

    const inputs = wrapper.findAll('input')

    await inputs[0].setValue('Southern Cross')
    await inputs[1].setValue('Docklands')

    expect(wrapper.emitted('update:currentLocation')).toBeTruthy()
    expect(wrapper.emitted('update:destination')).toBeTruthy()
    expect(wrapper.emitted('update:currentLocation')[0]).toEqual(['Southern Cross'])
    expect(wrapper.emitted('update:destination')[0]).toEqual(['Docklands'])
  })

  it('emits submit when button is clicked', async () => {
    const wrapper = mount(RouteSearchCard, {
      props: {
        currentLocation: 'A',
        destination: 'B',
        loading: false
      },
      global: {
        stubs: {
          BaseCard: {
            template: '<div><slot /></div>'
          },
          BaseButton: {
            props: ['disabled', 'variant'],
            emits: ['click'],
            template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>'
          }
        }
      }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('shows loading state correctly', () => {
    const wrapper = mount(RouteSearchCard, {
      props: {
        currentLocation: 'A',
        destination: 'B',
        loading: true
      },
      global: {
        stubs: {
          BaseCard: {
            template: '<div><slot /></div>'
          },
          BaseButton: {
            props: ['disabled', 'variant'],
            template: '<button :disabled="disabled"><slot /></button>'
          }
        }
      }
    })

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Loading Routes...')
  })
})