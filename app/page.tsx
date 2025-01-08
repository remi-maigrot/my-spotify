'use client';

import { useState } from 'react';
import { Search, Plus, Trash2, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MusicPlayer } from '@/components/MusicPlayer';
import { usePlaylist } from '@/hooks/usePlaylist';
import { searchTracks } from '@/lib/spotify';
import { Track } from '@/types/spotify';
import { Recommendations } from '@/components/Recommendations';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const { playlist, addToPlaylist, removeFromPlaylist } = usePlaylist();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const data = await searchTracks(searchQuery);
      setSearchResults(data.tracks?.items || []);
    } catch (error) {
      console.error('Error searching tracks:', error);
      setSearchResults([]);
    }
  };

  const renderTrackCard = (track: Track, actions: React.ReactNode) => (
    <Card key={track.id} className="p-4 flex items-center gap-4">
      <img
        src={track.album.images[0]?.url}
        alt={track.name}
        className="w-16 h-16 rounded"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{track.name}</h3>
        <p className="text-sm text-muted-foreground truncate">
          {track.artists.map((a) => a.name).join(', ')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentTrack(track)}
        >
          <Music className="h-4 w-4" />
        </Button>
        {actions}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">MySpotify</h1>

        <div className="flex gap-4 mb-8">
          <Input
            placeholder="Search for tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <Tabs defaultValue="search" className="mb-24">
          <TabsList>
            <TabsTrigger value="search">Search Results</TabsTrigger>
            <TabsTrigger value="playlist">My Playlist</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            {searchResults.map((track) =>
              renderTrackCard(track, (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => addToPlaylist(track)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ))
            )}
          </TabsContent>

          <TabsContent value="playlist" className="space-y-4">
            {playlist.map((track) =>
              renderTrackCard(track, (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromPlaylist(track.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ))
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Recommendations tracks={searchResults} />
          </TabsContent>
        </Tabs>
      </main>

      <MusicPlayer track={currentTrack} />
    </div>
  );
}
