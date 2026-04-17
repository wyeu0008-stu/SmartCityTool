export async function fetchTrafficNews() {
  const response = await fetch('/api/news/traffic')

  if (!response.ok) {
    let message = 'Failed to fetch traffic news'

    try {
      const errorData = await response.json()
      message = errorData.detail || message
    } catch {
      // ignore
    }

    throw new Error(message)
  }

  return await response.json()
}