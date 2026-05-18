import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { describe, expect, it } from 'vitest'
import AppFooter from '../layout/AppFooter.vue'

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/map', component: { template: '<div />' } },
      { path: '/insights', component: { template: '<div />' } },
      { path: '/dev', component: { template: '<div />' } },
      { path: '/dev/map', component: { template: '<div />' } },
      { path: '/dev/insights', component: { template: '<div />' } },
      { path: '/dev/more-info', component: { template: '<div />' } }
    ]
  })
}

describe('AppFooter', () => {
  it('renders release website map links', async () => {
    const router = createTestRouter()
    router.push('/')
    await router.isReady()

    const wrapper = mount(AppFooter, {
      global: {
        plugins: [router]
      }
    })

    const links = wrapper.findAll('.footer-links a')

    expect(wrapper.text()).toContain('Website Map')
    expect(wrapper.text()).toContain('Explore the function pages')
    expect(links.map((link) => link.text())).toEqual(['Home', 'Map', 'Safety Insights'])
    expect(links.map((link) => link.attributes('href'))).toEqual(['/', '/map', '/insights'])
  })

  it('renders dev website map links on dev pages', async () => {
    const router = createTestRouter()
    router.push('/dev/more-info')
    await router.isReady()

    const wrapper = mount(AppFooter, {
      global: {
        plugins: [router]
      }
    })

    const links = wrapper.findAll('.footer-links a')

    expect(links.map((link) => link.text())).toEqual(['Home', 'Map', 'Safety Insights', 'More Info'])
    expect(links.map((link) => link.attributes('href'))).toEqual(['/dev', '/dev/map', '/dev/insights', '/dev/more-info'])
  })
})
