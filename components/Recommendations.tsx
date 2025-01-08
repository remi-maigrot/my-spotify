'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePlaylist } from '@/hooks/usePlaylist';
import { Track } from '@/types/spotify';

type RecommendationsProps = {
  tracks: Track[];
};

export function Recommendations({ tracks }: RecommendationsProps) {
  const { playlist, addToPlaylist } = usePlaylist();
  const [recommendations, setRecommendations] = useState<Track[]>([]);

  useEffect(() => {
    generateRecommendations();
  }, [playlist]);

  const generateRecommendations = () => {
    if (playlist.length === 0) {
      setRecommendations([]);
      return;
    }

    const playlistArtistIds = new Set(playlist.map((track) => track.artists[0].id));
    const recommendedTracks = tracks.filter(
      (track) =>
        !playlist.some((pTrack) => pTrack.id === track.id) &&
        track.artists.some((artist) => playlistArtistIds.has(artist.id))
    );

    setRecommendations(recommendedTracks.slice(0, 10));
  };

  return (
    <div className="space-y-4">
      {recommendations.length > 0 ? (
        recommendations.map((track) => (
          <Card key={track.id} className="p-4 flex items-center gap-4">
            <img
              src={track.album.images[0]?.url}
              alt={track.name}
              className="w-16 h-16 rounded"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{track.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {track.artists.map((artist) => artist.name).join(', ')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => addToPlaylist(track)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Card>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">Aucune recommandation pour le moment.</p>
      )}
    </div>
  );
}
