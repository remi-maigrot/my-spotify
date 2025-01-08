'use client';

import { useEffect, useState } from 'react';
import { PlaylistTrack, Track } from '@/types/spotify';

export function usePlaylist() {
  const [playlist, setPlaylist] = useState<PlaylistTrack[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('myspotify-playlist');
    if (stored) {
      setPlaylist(JSON.parse(stored));
    }
  }, []);

  const addToPlaylist = (track: Track) => {
    const newTrack: PlaylistTrack = {
      ...track,
      addedAt: new Date().toISOString(),
    };
    const newPlaylist = [...playlist, newTrack];
    setPlaylist(newPlaylist);
    localStorage.setItem('myspotify-playlist', JSON.stringify(newPlaylist));
  };

  const removeFromPlaylist = (trackId: string) => {
    const newPlaylist = playlist.filter((track) => track.id !== trackId);
    setPlaylist(newPlaylist);
    localStorage.setItem('myspotify-playlist', JSON.stringify(newPlaylist));
  };

  return { playlist, addToPlaylist, removeFromPlaylist };
}