const MELBOURNE_LAT = -37.8136
const MELBOURNE_LON = 144.9631

function mapWeatherCode(code) {
  const codeMap = {
    0: 'Clear',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    95: 'Thunderstorm'
  }

  return codeMap[code] || 'Unknown'
}

export async function fetchCurrentWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${MELBOURNE_LAT}` +
    `&longitude=${MELBOURNE_LON}` +
    `&current=temperature_2m,wind_speed_10m,weather_code` +
    `&timezone=Australia%2FSydney`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch weather')
  }

  const data = await response.json()
  const current = data.current || {}

  return {
    temperature: current.temperature_2m,
    windSpeed: current.wind_speed_10m,
    description: mapWeatherCode(current.weather_code)
  }
}