import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useWeather } from '../useWeather'
import { fetchCurrentWeather } from '../../services/weatherService'

vi.mock('../../services/weatherService', () => ({
  fetchCurrentWeather: vi.fn()
}))

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads weather on mounted and updates state on success', async () => {
    const mockWeather = {
      temperature: 22,
      windSpeed: 14,
      description: 'Sunny'
    }

    fetchCurrentWeather.mockResolvedValue(mockWeather)

    let composable

    const TestComponent = defineComponent({
      setup() {
        composable = useWeather()
        return () => null
      }
    })

    mount(TestComponent)

    expect(composable.loading.value).toBe(true)
    expect(composable.error.value).toBe('')

    await Promise.resolve()
    await Promise.resolve()

    expect(fetchCurrentWeather).toHaveBeenCalledTimes(1)
    expect(composable.weather.value).toEqual(mockWeather)
    expect(composable.loading.value).toBe(false)
    expect(composable.error.value).toBe('')
  })

  it('sets error when fetchCurrentWeather fails', async () => {
    fetchCurrentWeather.mockRejectedValue(new Error('Weather API error'))

    let composable

    const TestComponent = defineComponent({
      setup() {
        composable = useWeather()
        return () => null
      }
    })

    mount(TestComponent)

    await Promise.resolve()
    await Promise.resolve()

    expect(fetchCurrentWeather).toHaveBeenCalledTimes(1)
    expect(composable.weather.value).toEqual({})
    expect(composable.error.value).toBe('Weather API error')
    expect(composable.loading.value).toBe(false)
  })

  it('uses fallback error message when error has no message', async () => {
    fetchCurrentWeather.mockRejectedValue({})

    let composable

    const TestComponent = defineComponent({
      setup() {
        composable = useWeather()
        return () => null
      }
    })

    mount(TestComponent)

    await Promise.resolve()
    await Promise.resolve()

    expect(composable.error.value).toBe('Failed to load weather')
    expect(composable.loading.value).toBe(false)
  })

  it('allows manual loadWeather call', async () => {
    const mockWeather = {
      temperature: 18,
      windSpeed: 9,
      description: 'Cloudy'
    }

    fetchCurrentWeather.mockResolvedValue(mockWeather)

    let composable

    const TestComponent = defineComponent({
      setup() {
        composable = useWeather()
        return () => null
      }
    })

    mount(TestComponent)

    await Promise.resolve()
    await Promise.resolve()

    fetchCurrentWeather.mockClear()

    await composable.loadWeather()

    expect(fetchCurrentWeather).toHaveBeenCalledTimes(1)
    expect(composable.weather.value).toEqual(mockWeather)
    expect(composable.loading.value).toBe(false)
    expect(composable.error.value).toBe('')
  })
})