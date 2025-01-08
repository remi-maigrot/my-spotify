'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { Track } from '@/types/spotify';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  track: Track | null;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}

export function MusicPlayer({ track, onNext, onPrevious, className }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (track?.preview_url) {
      audioRef.current = new Audio(track.preview_url);
      audioRef.current.volume = volume;
      setIsPlaying(false);
      setProgress(0);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      if (isPlaying) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-background border-t p-4", className)}>
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {track && (
          <>
            <img
              src={track.album.images[0]?.url}
              alt={track.name}
              className="w-12 h-12 rounded"
            />
            <div className="flex-1">
              <h3 className="font-medium">{track.name}</h3>
              <p className="text-sm text-muted-foreground">
                {track.artists.map(a => a.name).join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onPrevious && (
                <Button variant="ghost" size="icon" onClick={onPrevious}>
                  <SkipBack className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={togglePlay}>
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              {onNext && (
                <Button variant="ghost" size="icon" onClick={onNext}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-2 ml-4">
                <Volume2 className="h-4 w-4" />
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  className="w-24"
                  onValueChange={(value) => setVolume(value[0] / 100)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}