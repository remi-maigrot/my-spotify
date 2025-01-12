# MySpotify 🎵

MySpotify is a Next.js application that allows users to search for music, listen to tracks, create personal playlists, and receive recommendations based on their musical preferences.

Application link: [MySpotify](https://my-spotify-jonkoping.vercel.app/)

---

## 🚀 Main Features

1. **Music Search:** Users can search for songs using the Spotify API.
2. **Music Player:** An integrated player allows users to listen to tracks.
3. **Personal Playlists:** Users can add songs to a private, browser-stored playlist.
4. **Personalized Recommendations:** Recommendations are generated based on the user’s playlist. These recommendations utilize an **ontology** to establish relationships between artists and albums.

---

## 📖 Ontology Usage Description

In MySpotify, the ontology is used to structure and establish relationships between various musical elements such as artists, albums, and songs. These relationships enable:

- Analyzing the user’s playlist to extract associated artists and albums.
- Comparing these artists and albums with available tracks to provide relevant recommendations.

The idea is that users are likely to enjoy songs from the same artists or albums already present in their playlist.

### Example Code Illustrating Ontology Usage in the Application:

```typescript
export interface Track {
  id: string;
  name: string;
  artists: Array<{
    id: string,
    name: string;
  }>;
  album: {
    name: string;
    images: Array<{
      url: string;
    }>;
  };
  preview_url: string;
}

export interface PlaylistTrack extends Track {
  addedAt: string;
}
```

#### Quick Code Explanation:

- **`Track` :** Represents a music track with:
  - `id` : Unique identifier for the song.
  - `name` : Name of the song.
  - `artists` : List of associated artists, each with a unique identifier (`id`) and a name (`name`).
  - `album` : Album information, including its name and images (e.g., the cover).
  - `preview_url` : URL to listen to a song preview.
  
- **`PlaylistTrack` :** Extends the `Track` interface by adding an `addedAt` property, which indicates when the track was added to the playlist.

These structures clearly define relationships between tracks, artists, and albums, which are then used to generate recommendations.

---

## 🛠️ Installation and Setup

### Prerequisites

- **Node.js** (version >= 14.x)
- **npm** or **yarn**

### Steps to Run the Project Locally:

1. **Clone the Repository:**
   ```bash
   git clone <REPOSITORY_URL>
   cd myspotify
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   # or with yarn
   yarn install
   ```

3. **Set Up Environment Variables:**

   Create a `.env` file at the project root with the following variables (replace the values with those from your Spotify account):
   ```env
   NEXT_PUBLIC_CLIENT_ID=YourSpotifyClientID
   NEXT_PUBLIC_CLIENT_SECRET=YourSpotifyClientSecret
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   # or with yarn
   yarn dev
   ```

   The application will be available at: `http://localhost:3000`.

---

## 🌐 Production Version

The application is hosted on Vercel and available here: [https://my-spotify-jonkoping.vercel.app/](https://my-spotify-jonkoping.vercel.app/).  
Environment variables are already configured in production.

---

## 👥 Authors

- Rémi Maigrot
- Arthur Bourdin
- Mathieu Rio
- Alexandre Barbier

---