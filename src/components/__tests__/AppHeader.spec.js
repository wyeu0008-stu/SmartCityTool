import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { describe, expect, it } from 'vitest'
import AppHeader from '../layout/AppHeader.vue'

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/map', component: { template: '<div />' } },
      { path: '/insights', component: { template: '<div />' } },
      { path: '/dev', component: { template: '<div />' } },
      { path: '/dev/map', component: { template: '<div />' } },
      { path: '/dev/insights', component: { template: '<div />' } }
    ]
  })
}

describe('AppHeader', () => {
  it('renders release navigation by default', async () => {
    const router = createTestRouter()
    router.push('/')
    await router.isReady()

    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('SmartCycle Navigator')
    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Map')
    expect(wrapper.text()).toContain('Safety Insights')

    const links = wrapper.findAll('a')
    expect(links[0].attributes('href')).toBe('/')
    expect(links[1].attributes('href')).toBe('/map')
    expect(links[2].attributes('href')).toBe('/insights')
  })

  it('switches navigation base inside dev routes', async () => {
    const router = createTestRouter()
    router.push('/dev')
    await router.isReady()

    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const links = wrapper.findAll('a')
    expect(links[0].attributes('href')).toBe('/dev')
    expect(links[1].attributes('href')).toBe('/dev/map')
    expect(links[2].attributes('href')).toBe('/dev/insights')
  })
})
