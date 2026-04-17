import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TrafficNewsPanel from '../src/components/safety/TrafficNewsPanel.vue'

describe('TrafficNewsPanel.vue', () => {
  it('renders panel title correctly', () => {
    const wrapper = mount(TrafficNewsPanel)

    expect(wrapper.text()).toContain('Traffic & Cycling News')
  })

  it('shows loading state', () => {
    const wrapper = mount(TrafficNewsPanel, {
      props: {
        loading: true
      }
    })

    expect(wrapper.find('.status-text').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading news...')
    expect(wrapper.find('.news-list').exists()).toBe(false)
  })

  it('shows error state', () => {
    const wrapper = mount(TrafficNewsPanel, {
      props: {
        error: 'Failed to load news'
      }
    })

    expect(wrapper.find('.status-text.error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to load news')
    expect(wrapper.find('.news-list').exists()).toBe(false)
  })

  it('renders news items correctly', () => {
    const news = [
      {
        title: 'Cycling accident reported in Melbourne',
        description: 'A serious incident happened this morning.',
        source: 'ABC News',
        publishedAt: '2026-04-17T08:30:00Z',
        url: 'https://example.com/news-1'
      },
      {
        title: 'New bike lane plan announced',
        description: 'Council released a new cycling policy.',
        source: 'The Age',
        publishedAt: '2026-04-16T10:00:00Z',
        url: 'https://example.com/news-2'
      }
    ]

    const wrapper = mount(TrafficNewsPanel, {
      props: {
        news
      }
    })

    const cards = wrapper.findAll('.news-card')
    expect(cards).toHaveLength(2)

    expect(wrapper.text()).toContain('Cycling accident reported in Melbourne')
    expect(wrapper.text()).toContain('A serious incident happened this morning.')
    expect(wrapper.text()).toContain('ABC News')
    expect(wrapper.text()).toContain('2026-04-17')

    expect(wrapper.text()).toContain('New bike lane plan announced')
    expect(wrapper.text()).toContain('Council released a new cycling policy.')
    expect(wrapper.text()).toContain('The Age')
    expect(wrapper.text()).toContain('2026-04-16')
  })

  it('renders links correctly', () => {
    const news = [
      {
        title: 'Cycling accident reported in Melbourne',
        description: 'A serious incident happened this morning.',
        source: 'ABC News',
        publishedAt: '2026-04-17T08:30:00Z',
        url: 'https://example.com/news-1'
      }
    ]

    const wrapper = mount(TrafficNewsPanel, {
      props: {
        news
      }
    })

    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://example.com/news-1')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noreferrer')
    expect(link.text()).toBe('Read more')
  })

  it('assigns accident tag for titles containing accident', () => {
    const news = [
      {
        title: 'Major accident near city intersection',
        description: 'Traffic delays expected.',
        source: 'News',
        publishedAt: '2026-04-17T08:30:00Z',
        url: 'https://example.com/a'
      }
    ]

    const wrapper = mount(TrafficNewsPanel, {
      props: { news }
    })

    const tag = wrapper.find('.tag')
    expect(tag.text()).toBe('accident')
    expect(tag.classes()).toContain('accident')
  })

  it('assigns accident tag for titles containing crash', () => {
    const news = [
      {
        title: 'Bike crash on main road',
        description: 'Police are investigating.',
        source: 'News',
        publishedAt: '2026-04-17T08:30:00Z',
        url: 'https://example.com/b'
      }
    ]

    const wrapper = mount(TrafficNewsPanel, {
      props: { news }
    })

    const tag = wrapper.find('.tag')
    expect(tag.text()).toBe('accident')
    expect(tag.classes()).toContain('accident')
  })

  it('assigns policy tag for titles containing policy', () => {
    const news = [
      {
        title: 'Cycling policy updated by council',
        description: 'New rules will apply next month.',
        source: 'News',
        publishedAt: '2026-04-17T08:30:00Z',
        url: 'https://example.com/c'
      }
    ]

    const wrapper = mount(TrafficNewsPanel, {
      props: { news }
    })

    const tag = wrapper.find('.tag')
    expect(tag.text()).toBe('policy')
    expect(tag.classes()).toContain('policy')
  })

  it('assigns policy tag for titles containing plan', () => {
    const news = [
      {
        title: 'City releases safer cycling plan',
        description: 'The project starts this year.',
        source: 'News',
        publishedAt: '2026-04-17T08:30:00Z',
        url: 'https://example.com/d'
      }
    ]

    const wrapper = mount(TrafficNewsPanel, {
      props: { news }
    })

    const tag = wrapper.find('.tag')
    expect(tag.text()).toBe('policy')
    expect(tag.classes()).toContain('policy')
  })

  it('assigns general tag for other titles', () => {
    const news = [
      {
        title: 'Weekend cycling event attracts families',
        description: 'Many people joined the event.',
        source: 'News',
        publishedAt: '2026-04-17T08:30:00Z',
        url: 'https://example.com/e'
      }
    ]

    const wrapper = mount(TrafficNewsPanel, {
      props: { news }
    })

    const tag = wrapper.find('.tag')
    expect(tag.text()).toBe('general')
    expect(tag.classes()).toContain('general')
  })

  it('handles case-insensitive tag matching', () => {
    const news = [
      {
        title: 'CRASH update in downtown area',
        description: 'Road users advised to avoid the area.',
        source: 'News',
        publishedAt: '2026-04-17T08:30:00Z',
        url: 'https://example.com/f'
      }
    ]

    const wrapper = mount(TrafficNewsPanel, {
      props: { news }
    })

    const tag = wrapper.find('.tag')
    expect(tag.text()).toBe('accident')
    expect(tag.classes()).toContain('accident')
  })

  it('shows news list when not loading and no error', () => {
    const wrapper = mount(TrafficNewsPanel, {
      props: {
        news: [
          {
            title: 'City releases safer cycling plan',
            description: 'The project starts this year.',
            source: 'News',
            publishedAt: '2026-04-17T08:30:00Z',
            url: 'https://example.com/d'
          }
        ],
        loading: false,
        error: ''
      }
    })

    expect(wrapper.find('.news-list').exists()).toBe(true)
    expect(wrapper.findAll('.news-card')).toHaveLength(1)
  })

  it('prefers loading state over error state', () => {
    const wrapper = mount(TrafficNewsPanel, {
      props: {
        loading: true,
        error: 'Failed to load news'
      }
    })

    expect(wrapper.text()).toContain('Loading news...')
    expect(wrapper.text()).not.toContain('Failed to load news')
  })
})