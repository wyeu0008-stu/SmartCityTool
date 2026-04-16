const API_KEY = import.meta.env.VITE_GNEWS_API_KEY

export async function fetchTrafficNews() {
  if (!API_KEY) {
    throw new Error('Missing GNews API key')
  }

  const query = encodeURIComponent('cycling safety OR bike accident')
  const url =
    `https://gnews.io/api/v4/search` +
    `?q=${query}` +
    `&lang=en` +
    `&max=5` +
    `&apikey=${API_KEY}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch traffic news')
  }

  const data = await response.json()

  return (data.articles || []).map((item) => ({
    title: item.title,
    description: item.description,
    url: item.url,
    source: item.source?.name || 'Unknown source',
    publishedAt: item.publishedAt
  }))
}