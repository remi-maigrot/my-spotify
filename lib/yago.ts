const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';

export async function queryYagoOntology(artist: string) {
  try {
    // Recherche de l'artiste
    const searchResponse = await fetch(
      `${MUSICBRAINZ_API}/artist/?query=${encodeURIComponent(artist)}&fmt=json`,
      {
        headers: {
          'User-Agent': 'MusicDiscoveryApp/1.0',
          'Accept': 'application/json'
        }
      }
    );

    if (!searchResponse.ok) {
      throw new Error('MusicBrainz search failed');
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.artists || searchData.artists.length === 0) {
      return { results: { bindings: [] } };
    }

    // Récupérer le premier artiste trouvé
    const artistId = searchData.artists[0].id;

    // Récupérer les détails de l'artiste avec les relations
    const detailsResponse = await fetch(
      `${MUSICBRAINZ_API}/artist/${artistId}?inc=genres+artist-rels+instrument-rels+recording-rels+work-rels&fmt=json`,
      {
        headers: {
          'User-Agent': 'MusicDiscoveryApp/1.0',
          'Accept': 'application/json'
        }
      }
    );

    if (!detailsResponse.ok) {
      throw new Error('MusicBrainz details failed');
    }

    const details = await detailsResponse.json();

    // Transformer les données au format attendu par l'application
    const bindings = [];

    // Genres
    if (details.genres) {
      details.genres.forEach(genre => {
        bindings.push({
          genre: { value: genre.name }
        });
      });
    }

    // Instruments
    if (details.relations) {
      const instruments = details.relations.filter(rel => rel.type === 'instrument');
      instruments.forEach(inst => {
        bindings.push({
          instrument: { value: inst.instrument?.name }
        });
      });

      // Influences et collaborations
      const artistRels = details.relations.filter(rel => rel.type === 'influenced by' || rel.type === 'collaboration');
      artistRels.forEach(rel => {
        if (rel.type === 'influenced by') {
          bindings.push({
            influence: { value: rel.artist?.name }
          });
        } else {
          bindings.push({
            associatedAct: { value: rel.artist?.name }
          });
        }
      });
    }

    // Informations de base
    if (details.area) {
      bindings.push({
        nationality: { value: details.area.name }
      });
    }

    if (details.begin_area) {
      bindings.push({
        birthPlace: { value: details.begin_area.name }
      });
    }

    if (details.life_span?.begin) {
      bindings.push({
        birthDate: { value: details.life_span.begin }
      });
    }

    // Ajouter une description basique
    bindings.push({
      abstract: { 
        value: `${details.name} est un artiste musical ${details.gender || ''} ${details.type || 'person'} ${
          details.life_span?.begin ? `né(e) en ${details.life_span.begin}` : ''
        }. ${
          details.genres?.length > 0 ? `Connu(e) pour ses œuvres dans les genres ${details.genres.map(g => g.name).join(', ')}.` : ''
        }`
      }
    });

    return { results: { bindings } };
  } catch (error) {
    console.error('Error querying MusicBrainz:', error);
    return { results: { bindings: [] } };
  }
}