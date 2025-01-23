import { Track } from '@/types/spotify';

const SPOTIFY_API = 'https://api.spotify.com/v1';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAccessToken() {
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    const basic = btoa(`${process.env.NEXT_PUBLIC_CLIENT_ID}:${process.env.NEXT_PUBLIC_CLIENT_SECRET}`);
    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    return accessToken;
}

export async function searchTracks(query: string) {
    const token = await getAccessToken();
    const response = await fetch(
        `${SPOTIFY_API}/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.json();
}

export async function getRecommendations(seedTracks: string[]) {
    const token = await getAccessToken();
    const response = await fetch(
        `${SPOTIFY_API}/recommendations?seed_tracks=${seedTracks.join(',')}&limit=10`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.json();
}