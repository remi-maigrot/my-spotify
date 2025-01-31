"use client";

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Music, PlayCircle, ListMusic, Brain, Info, Star, Award, Mic2, Clock, MapPin, Book, Users, Disc, Radio, Code, Network, Database, GitBranch, User } from "lucide-react";
import { searchTracks } from '@/lib/spotify';
import { queryYagoOntology } from '@/lib/yago';
import { PrologEngine } from '@/lib/prolog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [ontologyData, setOntologyData] = useState({});
  const [prolog] = useState(() => new PrologEngine());
  const [loading, setLoading] = useState({});

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const tracks = await searchTracks(searchQuery);
    setSearchResults(tracks);
  };

  const addToPlaylist = async (track) => {
    if (!playlist.find(t => t.id === track.id)) {
      const newPlaylist = [...playlist, track];
      setPlaylist(newPlaylist);
      await updateRecommendations(track, newPlaylist);
    }
  };

  const viewOntology = async (track) => {
    try {
      setLoading(prev => ({ ...prev, [track.id]: true }));
      const data = await queryYagoOntology(track.artists[0].name);
      setOntologyData(prevData => ({
        ...prevData,
        [track.id]: data.results?.bindings || []
      }));
    } catch (error) {
      console.error('Error fetching ontology:', error);
    } finally {
      setLoading(prev => ({ ...prev, [track.id]: false }));
    }
  };

  const updateRecommendations = async (track, currentPlaylist = playlist) => {
    try {
      const data = await queryYagoOntology(track.artists[0].name);
      
      if (data.results?.bindings) {
        data.results.bindings.forEach(binding => {
          if (binding.genre?.value) {
            prolog.addFact(`genre(${track.id}, "${binding.genre.value}")`);
          }
          if (binding.influence?.value) {
            prolog.addFact(`influence(${track.id}, "${binding.influence.value}")`);
          }
          if (binding.style?.value) {
            prolog.addFact(`style(${track.id}, "${binding.style.value}")`);
          }
          if (binding.instrument?.value) {
            prolog.addFact(`instrument(${track.id}, "${binding.instrument.value}")`);
          }
          prolog.addArtistInfo(track.id, {
            abstract: binding.abstract?.value,
            birthPlace: binding.birthPlace?.value,
            activeYears: binding.activeYears?.value,
            associatedActs: binding.associatedAct?.value,
            awards: binding.award?.value,
            occupation: binding.occupation?.value,
            nationality: binding.nationality?.value,
            description: binding.description?.value,
            period: binding.period?.value,
            movement: binding.movement?.value
          });
        });

        const similarTracks = await Promise.all(
          currentPlaylist.map(async (t) => {
            const artistName = t.artists[0].name;
            const results = await searchTracks(`artist:${artistName}`);
            return results.slice(0, 3);
          })
        );

        const uniqueTracks = Array.from(
          new Set(similarTracks.flat().map(t => t.id))
        ).map(id => similarTracks.flat().find(t => t.id === id));

        const newRecommendations = prolog.generateRecommendations(
          currentPlaylist.map(t => t.artists[0].name)
        );

        setRecommendations(
          newRecommendations.map(rec => ({
            ...rec,
            similarTracks: uniqueTracks.slice(0, 3)
          }))
        );
      }
    } catch (error) {
      console.error('Error updating recommendations:', error);
    }
  };

  useEffect(() => {
    if (playlist.length > 0) {
      updateRecommendations(playlist[playlist.length - 1]);
    }
  }, [playlist]);

  const TrackCard = ({ track, showAddToPlaylist = true }) => (
    <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
      <CardContent className="flex items-center gap-4 p-4">
        <img 
          src={track.album.images[1]?.url || track.album.images[0]?.url} 
          alt={track.name}
          className="w-16 h-16 rounded-md object-cover shadow-md"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{track.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {track.artists.map(a => a.name).join(', ')}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Album: {track.album.name}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="icon"
            className="hover:bg-primary/10"
            onClick={() => setCurrentTrack(track)}
          >
            <PlayCircle className="h-4 w-4" />
          </Button>
          {showAddToPlaylist && (
            <Button 
              size="icon"
              className="bg-primary hover:bg-primary/90"
              onClick={() => addToPlaylist(track)}
            >
              <ListMusic className="h-4 w-4" />
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="hover:bg-blue-500/10"
                onClick={() => viewOntology(track)}
              >
                <Brain className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Brain className="h-5 w-5" />
                  Ontologie pour {track.artists[0].name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {loading[track.id] ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Chargement des données...</p>
                  </div>
                ) : ontologyData[track.id]?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune donnée ontologique trouvée pour cet artiste
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {/* Biographie */}
                    {ontologyData[track.id]?.[0]?.abstract && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 text-lg flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Biographie
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {ontologyData[track.id][0].abstract.value}
                        </p>
                      </div>
                    )}

                    {/* Informations de base */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Informations personnelles
                        </h4>
                        <dl className="space-y-2">
                          {ontologyData[track.id]?.[0]?.birthPlace && (
                            <div>
                              <dt className="text-sm text-gray-500">Lieu de naissance</dt>
                              <dd>{ontologyData[track.id][0].birthPlace.value}</dd>
                            </div>
                          )}
                          {ontologyData[track.id]?.[0]?.birthDate && (
                            <div>
                              <dt className="text-sm text-gray-500">Date de naissance</dt>
                              <dd>{new Date(ontologyData[track.id][0].birthDate.value).toLocaleDateString()}</dd>
                            </div>
                          )}
                          {ontologyData[track.id]?.[0]?.nationality && (
                            <div>
                              <dt className="text-sm text-gray-500">Nationalité</dt>
                              <dd>{ontologyData[track.id][0].nationality.value}</dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Music className="h-4 w-4" />
                          Carrière musicale
                        </h4>
                        <dl className="space-y-2">
                          {ontologyData[track.id]?.[0]?.activeYears && (
                            <div>
                              <dt className="text-sm text-gray-500">Début de carrière</dt>
                              <dd>{ontologyData[track.id][0].activeYears.value}</dd>
                            </div>
                          )}
                          {ontologyData[track.id]?.[0]?.recordLabel && (
                            <div>
                              <dt className="text-sm text-gray-500">Label</dt>
                              <dd>{ontologyData[track.id][0].recordLabel.value}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>

                    {/* Genres et styles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Music className="h-4 w-4" />
                          Genres et styles
                        </h4>
                        <ul className="space-y-1">
                          {ontologyData[track.id]?.filter(b => b.genre?.value).map((binding, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-primary rounded-full" />
                              {binding.genre.value}
                            </li>
                          ))}
                          {ontologyData[track.id]?.filter(b => b.style?.value).map((binding, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full" />
                              {binding.style.value}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Influences
                        </h4>
                        <ul className="space-y-1">
                          {ontologyData[track.id]?.filter(b => b.influence?.value).map((binding, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                              {binding.influence.value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Récompenses et instruments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Récompenses
                        </h4>
                        <ul className="space-y-1">
                          {ontologyData[track.id]?.filter(b => b.award?.value).map((binding, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                              {binding.award.value}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Mic2 className="h-4 w-4" />
                          Instruments
                        </h4>
                        <ul className="space-y-1">
                          {ontologyData[track.id]?.filter(b => b.instrument?.value).map((binding, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-purple-500 rounded-full" />
                              {binding.instrument.value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Collaborations */}
                    {ontologyData[track.id]?.filter(b => b.collaborator?.value || b.associatedAct?.value).length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Collaborations et artistes associés
                        </h4>
                        <ul className="space-y-1">
                          {ontologyData[track.id]?.filter(b => b.collaborator?.value).map((binding, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full" />
                              {binding.collaborator.value}
                            </li>
                          ))}
                          {ontologyData[track.id]?.filter(b => b.associatedAct?.value).map((binding, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full" />
                              {binding.associatedAct.value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 pb-24">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          MySpotify / Jonkoping University
        </h1>
        
        <div className="flex gap-4 mb-8">
          <Input
            placeholder="Rechercher une musique..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
            <Search className="mr-2 h-4 w-4" />
            Rechercher
          </Button>
        </div>

        <Tabs defaultValue="search" className="space-y-4">
          <TabsList className="w-full justify-start bg-white dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="search" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Search className="mr-2 h-4 w-4" />
              Résultats
            </TabsTrigger>
            <TabsTrigger value="playlist" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <ListMusic className="mr-2 h-4 w-4" />
              Ma Playlist ({playlist.length})
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Music className="mr-2 h-4 w-4" />
              Recommandations ({recommendations.length})
            </TabsTrigger>
            <TabsTrigger value="ontology" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Code className="mr-2 h-4 w-4" />
              Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            {searchResults.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Recherchez une musique pour commencer
              </div>
            ) : (
              searchResults.map(track => (
                <TrackCard key={track.id} track={track} />
              ))
            )}
          </TabsContent>

          <TabsContent value="playlist" className="space-y-4">
            {playlist.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Ajoutez des musiques à votre playlist pour obtenir des recommandations
              </div>
            ) : (
              playlist.map(track => (
                <TrackCard key={track.id} track={track} showAddToPlaylist={false} />
              ))
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Ajoutez des musiques à votre playlist pour obtenir des recommandations
              </div>
            ) : (
              recommendations.map((rec) => (
                <Card key={rec.id} className="bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{rec.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Score de correspondance: {rec.score.toFixed(1)}
                        </p>
                      </div>
                    </div>

                    {/* Processus de recommandation */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Processus de recommandation
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">1</div>
                          <div className="flex-1">
                            <p className="font-medium">Analyse de l'ontologie</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Extraction des métadonnées musicales via DBpedia/YAGO
                            </p>
                          </div>
                        </div>
                        <div className="h-6 border-l-2 border-dashed border-gray-300 ml-4"></div>
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">2</div>
                          <div className="flex-1">
                            <p className="font-medium">Correspondance des attributs</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Comparaison des genres, styles, influences et instruments
                            </p>
                          </div>
                        </div>
                        <div className="h-6 border-l-2 border-dashed border-gray-300 ml-4"></div>
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">3</div>
                          <div className="flex-1">
                            <p className="font-medium">Calcul du score</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Pondération des correspondances pour générer un score global
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Détails des correspondances */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {rec.matchDetails.genres.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Music className="h-4 w-4" />
                            Genres communs
                          </h4>
                          <ul className="space-y-1">
                            {rec.matchDetails.genres.map((genre, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full" />
                                {genre}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {rec.matchDetails.influences.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Influences communes
                          </h4>
                          <ul className="space-y-1">
                            {rec.matchDetails.influences.map((influence, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                {influence}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Styles et instruments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {rec.matchDetails.styles.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Music className="h-4 w-4" />
                            Styles musicaux communs
                          </h4>
                          <ul className="space-y-1">
                            {rec.matchDetails.styles.map((style, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full" />
                                {style}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {rec.matchDetails.instruments.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Mic2 className="h-4 w-4" />
                            Instruments communs
                          </h4>
                          <ul className="space-y-1">
                            {rec.matchDetails.instruments.map((instrument, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full" />
                                {instrument}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Titres similaires */}
                    {rec.similarTracks && rec.similarTracks.length > 0 && (
                      <div className="mt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Disc className="h-4 w-4" />
                          Titres similaires recommandés
                        </h4>
                        <div className="space-y-3">
                          {rec.similarTracks.map((track, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg">
                              <img
                                src={track.album.images[2]?.url || track.album.images[0]?.url}
                                alt={track.name}
                                className="w-10 h-10 rounded-md"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{track.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {track.artists.map(a => a.name).join(', ')}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="flex-shrink-0"
                                onClick={() => setCurrentTrack(track)}
                              >
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="ontology" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Documentation de l'Ontologie Musicale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Architecture */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Architecture
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">1. Sources de données</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>DBpedia: Base de connaissances structurée extraite de Wikipedia</li>
                        <li>YAGO: Ontologie de haute qualité construite à partir de Wikipedia, WordNet et GeoNames</li>
                        <li>Spotify API: Métadonnées musicales et informations sur les artistes</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">2. Structure des données</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>Artistes (dbo:MusicalArtist)
                          <ul className="ml-6 list-circle">
                            <li>Informations biographiques</li>
                            <li>Carrière musicale</li>
                            <li>Récompenses et distinctions</li>
                          </ul> </li>
                        <li>Relations musicales
                          <ul className="ml-6 list-circle">
                            <li>Genres (dbo:genre)</li>
                            <li>Influences (dbo:influencedBy)</li>
                            <li>Collaborations (dbo:associatedMusicalArtist)</li>
                          </ul>
                        </li>
                        <li>Aspects techniques
                          <ul className="ml-6 list-circle">
                            <li>Instruments (dbo:instrument)</li>
                            <li>Styles musicaux (dbo:musicStyle)</li>
                            <li>Labels (dbo:recordLabel)</li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Intégration YAGO */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Intégration de YAGO
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">1. Requêtes SPARQL</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Exemple de requête SPARQL pour extraire les informations d'un artiste :
                      </p>
                      <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
{`PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX yago: <http://yago-knowledge.org/resource/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?property ?value
WHERE {
  ?artist a dbo:MusicalArtist ;
          rdfs:label ?name ;
          ?property ?value .
  FILTER(CONTAINS(LCASE(?name), LCASE("\${artist}")))`}
                      </pre>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">2. Traitement des données</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>Nettoyage et normalisation des résultats</li>
                        <li>Filtrage des langues (priorité à l'anglais)</li>
                        <li>Dédoublonnage des informations</li>
                        <li>Enrichissement avec des données complémentaires</li>
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">3. Calcul des scores</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Système de pondération pour les recommandations :
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>Genre musical : 2 points (forte correspondance)</li>
                        <li>Influence musicale : 1.5 points (influence directe)</li>
                        <li>Style musical : 1.5 points (caractéristiques similaires)</li>
                        <li>Instrument : 1 point (aspect technique)</li>
                        <li>Collaboration : 1 point (connexion directe)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Exemple d'utilisation */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Exemple d'utilisation dans le code
                  </h3>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
{`// Requête des données ontologiques
const data = await queryYagoOntology(artistName);

// Traitement des résultats
data.results.bindings.forEach(binding => {
  // Extraction des propriétés
  const genre = binding.genre?.value;
  const influence = binding.influence?.value;
  const style = binding.style?.value;
  
  // Ajout aux faits Prolog
  if (genre) prolog.addFact(\`genre(\${trackId}, "\${genre}")\`);
  if (influence) prolog.addFact(\`influence(\${trackId}, "\${influence}")\`);
  if (style) prolog.addFact(\`style(\${trackId}, "\${style}")\`);
});

// Génération des recommandations
const recommendations = prolog.generateRecommendations(playlist);`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {currentTrack && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="container mx-auto p-4">
              <iframe
                src={`https://open.spotify.com/embed/track/${currentTrack.id}`}
                width="100%"
                height="80"
                frameBorder="0"
                allow="encrypted-media"
                className="rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}