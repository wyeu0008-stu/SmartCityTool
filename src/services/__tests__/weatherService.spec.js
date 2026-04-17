import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchCurrentWeather } from '../weatherService'

describe('fetchCurrentWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('calls Open-Meteo API with correct Melbourne coordinates', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 21,
          wind_speed_10m: 13,
          weather_code: 2
        }
      })
    })

    await fetchCurrentWeather()

    expect(global.fetch).toHaveBeenCalledTimes(1)

    const calledUrl = global.fetch.mock.calls[0][0]
    expect(calledUrl).toContain('https://api.open-meteo.com/v1/forecast')
    expect(calledUrl).toContain('latitude=-37.8136')
    expect(calledUrl).toContain('longitude=144.9631')
    expect(calledUrl).toContain('current=temperature_2m,wind_speed_10m,weather_code')
    expect(calledUrl).toContain('timezone=Australia%2FSydney')
  })

  it('throws an error when fetch response is not ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false
    })

    await expect(fetchCurrentWeather()).rejects.toThrow('Failed to fetch weather')
  })

  it('returns mapped weather data correctly for known weather code', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 18,
          wind_speed_10m: 9,
          weather_code: 0
        }
      })
    })

    const result = await fetchCurrentWeather()

    expect(result).toEqual({
      temperature: 18,
      windSpeed: 9,
      description: 'Clear'
    })
  })

  it('returns Unknown for unknown weather code', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 16,
          wind_speed_10m: 20,
          weather_code: 999
        }
      })
    })

    const result = await fetchCurrentWeather()

    expect(result).toEqual({
      temperature: 16,
      windSpeed: 20,
      description: 'Unknown'
    })
  })

  it('handles missing current weather data gracefully', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    })

    const result = await fetchCurrentWeather()

    expect(result).toEqual({
      temperature: undefined,
      windSpeed: undefined,
      description: 'Unknown'
    })
  })

  it('maps another known weather code correctly', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 12,
          wind_speed_10m: 25,
          weather_code: 95
        }
      })
    })

    const result = await fetchCurrentWeather()

    expect(result).toEqual({
      temperature: 12,
      windSpeed: 25,
      description: 'Thunderstorm'
    })
  })
})