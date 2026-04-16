import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SafetyInsightsView from '../SafetyInsightsView.vue'

const mockWeather = ref({
  temperature: 22,
  condition: 'Sunny'
})

const mockNews = ref([
  { title: 'Road closure in CBD', link: '#' },
  { title: 'Bike lane update', link: '#' }
])

const mockWeatherLoading = ref(false)
const mockWeatherError = ref('')

const mockNewsLoading = ref(false)
const mockNewsError = ref('')

vi.mock('../../composables/useWeather', () => ({
  useWeather: () => ({
    weather: mockWeather,
    loading: mockWeatherLoading,
    error: mockWeatherError
  })
}))

vi.mock('../../composables/useTrafficNews', () => ({
  useTrafficNews: () => ({
    news: mockNews,
    loading: mockNewsLoading,
    error: mockNewsError
  })
}))

describe('SafetyInsightsView', () => {
  beforeEach(() => {
    mockWeather.value = {
      temperature: 22,
      condition: 'Sunny'
    }
    mockNews.value = [
      { title: 'Road closure in CBD', link: '#' },
      { title: 'Bike lane update', link: '#' }
    ]
    mockWeatherLoading.value = false
    mockWeatherError.value = ''
    mockNewsLoading.value = false
    mockNewsError.value = ''
  })

  function createWrapper() {
    return mount(SafetyInsightsView, {
      global: {
        stubs: {
          TodayOverviewCard: {
            name: 'TodayOverviewCard',
            props: ['dateText', 'weather', 'loading', 'error'],
            template: '<div class="today-overview-stub">TodayOverviewCard</div>'
          },
          TrafficNewsPanel: {
            name: 'TrafficNewsPanel',
            props: ['news', 'loading', 'error'],
            template: '<div class="traffic-news-stub">TrafficNewsPanel</div>'
          }
        }
      }
    })
  }

  it('renders page title and subtitle', () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Safety Insights')
    expect(wrapper.text()).toContain(
      'Real-time weather, daily context, and local traffic-related cycling news.'
    )
  })

  it('renders both child components', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('.today-overview-stub').exists()).toBe(true)
    expect(wrapper.find('.traffic-news-stub').exists()).toBe(true)
  })

  it('passes weather props to TodayOverviewCard', () => {
    const wrapper = createWrapper()
    const todayCard = wrapper.findComponent({ name: 'TodayOverviewCard' })

    expect(todayCard.exists()).toBe(true)
    expect(todayCard.props('weather')).toEqual({
      temperature: 22,
      condition: 'Sunny'
    })
    expect(todayCard.props('loading')).toBe(false)
    expect(todayCard.props('error')).toBe('')
    expect(typeof todayCard.props('dateText')).toBe('string')
  })

  it('passes news props to TrafficNewsPanel', () => {
    const wrapper = createWrapper()
    const newsPanel = wrapper.findComponent({ name: 'TrafficNewsPanel' })

    expect(newsPanel.exists()).toBe(true)
    expect(newsPanel.props('news')).toEqual([
      { title: 'Road closure in CBD', link: '#' },
      { title: 'Bike lane update', link: '#' }
    ])
    expect(newsPanel.props('loading')).toBe(false)
    expect(newsPanel.props('error')).toBe('')
  })

  it('passes error states correctly', () => {
    mockWeatherError.value = 'Weather API failed'
    mockNewsError.value = 'News API failed'

    const wrapper = createWrapper()
    const todayCard = wrapper.findComponent({ name: 'TodayOverviewCard' })
    const newsPanel = wrapper.findComponent({ name: 'TrafficNewsPanel' })

    expect(todayCard.props('error')).toBe('Weather API failed')
    expect(newsPanel.props('error')).toBe('News API failed')
  })

  it('passes loading states correctly', () => {
    mockWeatherLoading.value = true
    mockNewsLoading.value = true

    const wrapper = createWrapper()
    const todayCard = wrapper.findComponent({ name: 'TodayOverviewCard' })
    const newsPanel = wrapper.findComponent({ name: 'TrafficNewsPanel' })

    expect(todayCard.props('loading')).toBe(true)
    expect(newsPanel.props('loading')).toBe(true)
  })
})