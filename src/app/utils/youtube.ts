export async function searchYouTubeVideo(query: string): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/youtube?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return null;
  }
} 