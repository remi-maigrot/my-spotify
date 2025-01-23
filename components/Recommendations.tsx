'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { usePlaylist } from '@/hooks/usePlaylist';
import { Track } from '@/types/spotify';

type RecommendationsProps = {
    tracks: Track[];
};

export function Recommendations({ tracks }: RecommendationsProps) {
    const { playlist, addToPlaylist } = usePlaylist();
    const [recommendations, setRecommendations] = useState<Track[]>([]);
    const [explanationSteps, setExplanationSteps] = useState<string[]>([]);
    const [detailedComparison, setDetailedComparison] = useState<string[]>([]);

    useEffect(() => {
        generateRecommendations();
    }, [playlist]);

    const generateRecommendations = () => {
        const newExplanationSteps: string[] = [];
        const newDetailedComparison: string[] = [];

        if (playlist.length === 0) {
            setRecommendations([]);
            setExplanationSteps([]);
            setDetailedComparison([]);
            return;
        }

        const playlistArtistIds = new Set(playlist.map((track) => track.artists[0]?.id));
        const playlistAlbumIds = new Set(playlist.map((track) => track.album.name));

        newExplanationSteps.push('Step 1: Analyze the artists and albums in your playlist.');
        newDetailedComparison.push(`Artists in the playlist : ${playlist.map((track) => track.artists[0].name).join(', ')}`);
        newDetailedComparison.push(`Albums in the playlist : ${playlist.map((track) => track.album.name).join(', ')}`);

        const recommendedTracks = tracks.filter((track) => {
            const isArtistInPlaylist = track.artists.some((artist) => playlistArtistIds.has(artist.id));
            const isAlbumInPlaylist = playlistAlbumIds.has(track.album.name);
            if (isArtistInPlaylist || isAlbumInPlaylist) {
                newDetailedComparison.push(`Recommended track : "${track.name}" de ${track.artists.map((artist) => artist.name).join(', ')} (Artist compared : ${track.artists.map((artist) => artist.name).join(', ')})`);
                newDetailedComparison.push(`Album compared : ${track.album.name}`);
            }
            return (
                !playlist.some((pTrack) => pTrack.id === track.id) &&
                (isArtistInPlaylist || isAlbumInPlaylist)
            );
        });

        newExplanationSteps.push('Step 2: Filter similar songs from artists or albums in the playlist.');

        setRecommendations(recommendedTracks.slice(0, 10));
        newExplanationSteps.push('Step 3: Limit the number of recommendations to 10.');

        setExplanationSteps(newExplanationSteps);
        setDetailedComparison(newDetailedComparison);
    };

    const renderTrackCard = (track: Track) => (
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
                <p className="text-sm text-muted-foreground truncate">
                    Album: {track.album.name}
                </p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => addToPlaylist(track)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </Card>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Recommendations Based on Your Playlist</h2>

            <div className="mb-6 p-4 bg-gray-100 rounded">
                <h3 className="text-xl font-semibold mb-2">Explanation of the Recommendation Algorithm :</h3>
                <ul className="list-decimal pl-4">
                    {explanationSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                    ))}
                </ul>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="text-xl font-semibold mb-2">Comparison of Artists and Albums :</h3>
                <ul className="list-decimal pl-4">
                    {detailedComparison.map((comparison, index) => (
                        <li key={index}>{comparison}</li>
                    ))}
                </ul>
            </div>

            <div className="space-y-4">
                {recommendations.length > 0 ? (
                    recommendations.map(renderTrackCard)
                ) : (
                    <p className="text-sm text-muted-foreground">No recommendations for the moment.</p>
                )}
            </div>
        </div>
    );
}
