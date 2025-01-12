'use client';

import { useState } from 'react';
import { Track } from '@/types/spotify';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  track: Track | null;
  accessToken: string;  // Ajoutez l'accessToken ici
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}

export function MusicPlayer({ track, accessToken, onNext, onPrevious, className }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-background border-t p-4", className)}>
      {/* Vérification que track est non null avant d'afficher l'iframe */}
      {track ? (
        <div className="w-full h-[80px] mt-4">
          <iframe
            src={`https://open.spotify.com/embed/track/${track.id}`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <p>Track is unavailable</p>  // Message de fallback si track est null
      )}
    </div>
  );
}