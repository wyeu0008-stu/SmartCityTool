export async function fetchCyclingTips() {
  const response = await fetch('/api/tips')

  if (!response.ok) {
    throw new Error('Failed to fetch cycling tips')
  }

  const data = await response.json()
  return data.tips || []
}