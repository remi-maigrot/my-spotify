const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

async function getAccessToken() {
  const basic = Buffer.from(`${process.env.NEXT_PUBLIC_CLIENT_ID}:${process.env.NEXT_PUBLIC_CLIENT_SECRET}`).toString('base64');
  
  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw error;
  }
}

export async function searchTracks(query: string) {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(
      `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search tracks');
    }

    const data = await response.json();
    return data.tracks.items;
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
}