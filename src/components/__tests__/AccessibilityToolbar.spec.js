import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import AccessibilityToolbar from '../layout/AccessibilityToolbar.vue'

describe('AccessibilityToolbar', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('a11y-large-text', 'a11y-high-contrast', 'a11y-reduced-motion')
  })

  afterEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('a11y-large-text', 'a11y-high-contrast', 'a11y-reduced-motion')
  })

  it('renders WCAG-oriented accessibility controls', () => {
    const wrapper = mount(AccessibilityToolbar)

    expect(wrapper.attributes('aria-label')).toBe('Accessibility tools')
    expect(wrapper.find('.accessibility-trigger').attributes('aria-label')).toBe('Open accessibility options')
    expect(wrapper.find('.accessibility-trigger svg').exists()).toBe(true)
    expect(wrapper.find('.accessibility-trigger').attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).not.toContain('Larger Text')
  })

  it('toggles accessibility classes and pressed states', async () => {
    const wrapper = mount(AccessibilityToolbar)
    await wrapper.find('.accessibility-trigger').trigger('click')

    const buttons = wrapper.findAll('.accessibility-panel button')

    await buttons[0].trigger('click')
    await buttons[1].trigger('click')
    await buttons[2].trigger('click')

    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    expect(buttons[1].attributes('aria-pressed')).toBe('true')
    expect(buttons[2].attributes('aria-pressed')).toBe('true')
    expect(document.documentElement.classList.contains('a11y-large-text')).toBe(true)
    expect(document.documentElement.classList.contains('a11y-high-contrast')).toBe(true)
    expect(document.documentElement.classList.contains('a11y-reduced-motion')).toBe(true)
  })

  it('opens a secondary menu from the small accessibility button', async () => {
    const wrapper = mount(AccessibilityToolbar)

    await wrapper.find('.accessibility-trigger').trigger('click')

    expect(wrapper.find('.accessibility-trigger').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.accessibility-panel').exists()).toBe(true)
    expect(wrapper.text()).toContain('Larger Text')
    expect(wrapper.text()).toContain('High Contrast')
    expect(wrapper.text()).toContain('Reduce Motion')
  })
})
