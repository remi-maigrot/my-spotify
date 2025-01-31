export class PrologEngine {
  private facts: Set<string> = new Set();
  private rules: Map<string, string[]> = new Map();
  private genres: Map<string, Set<string>> = new Map();
  private influences: Map<string, Set<string>> = new Map();
  private artistInfo: Map<string, any> = new Map();
  private styles: Map<string, Set<string>> = new Map();
  private instruments: Map<string, Set<string>> = new Map();
  private similarArtists: Map<string, Set<string>> = new Map();

  addFact(fact: string) {
    this.facts.add(fact);
    
    const genreMatch = fact.match(/genre\((.*?),\s*(.*?)\)/);
    const influenceMatch = fact.match(/influence\((.*?),\s*(.*?)\)/);
    const styleMatch = fact.match(/style\((.*?),\s*(.*?)\)/);
    const instrumentMatch = fact.match(/instrument\((.*?),\s*(.*?)\)/);
    const similarArtistMatch = fact.match(/similarArtist\((.*?),\s*(.*?)\)/);
    
    if (genreMatch) {
      const [_, trackId, genre] = genreMatch;
      if (!this.genres.has(trackId)) {
        this.genres.set(trackId, new Set());
      }
      this.genres.get(trackId).add(genre);
    }
    
    if (influenceMatch) {
      const [_, trackId, influence] = influenceMatch;
      if (!this.influences.has(trackId)) {
        this.influences.set(trackId, new Set());
      }
      this.influences.get(trackId).add(influence);
    }

    if (styleMatch) {
      const [_, trackId, style] = styleMatch;
      if (!this.styles.has(trackId)) {
        this.styles.set(trackId, new Set());
      }
      this.styles.get(trackId).add(style);
    }

    if (instrumentMatch) {
      const [_, trackId, instrument] = instrumentMatch;
      if (!this.instruments.has(trackId)) {
        this.instruments.set(trackId, new Set());
      }
      this.instruments.get(trackId).add(instrument);
    }

    if (similarArtistMatch) {
      const [_, trackId, similarArtist] = similarArtistMatch;
      if (!this.similarArtists.has(trackId)) {
        this.similarArtists.set(trackId, new Set());
      }
      this.similarArtists.get(trackId).add(similarArtist);
    }
  }

  addArtistInfo(trackId: string, info: any) {
    this.artistInfo.set(trackId, {
      ...this.artistInfo.get(trackId),
      ...info,
      education: info.education,
      almaMater: info.almaMater,
      recordLabel: info.recordLabel,
      memberOf: info.memberOf,
      formerBandMember: info.formerBandMember,
      background: info.background,
      careerStart: info.careerStart,
      careerEnd: info.careerEnd,
      notableWork: info.notableWork,
      residence: info.residence,
      similarArtist: info.similarArtist,
      influenced: info.influenced,
      collaborator: info.collaborator,
      producer: info.producer,
      writer: info.writer,
      composer: info.composer
    });
  }

  generateRecommendations(artists: string[]): Array<any> {
    const recommendations: Array<any> = [];
    
    const allGenres = new Set<string>();
    const allInfluences = new Set<string>();
    const allStyles = new Set<string>();
    const allInstruments = new Set<string>();
    const allSimilarArtists = new Set<string>();
    
    this.genres.forEach(genres => genres.forEach(genre => allGenres.add(genre)));
    this.influences.forEach(influences => influences.forEach(influence => allInfluences.add(influence)));
    this.styles.forEach(styles => styles.forEach(style => allStyles.add(style)));
    this.instruments.forEach(instruments => instruments.forEach(instrument => allInstruments.add(instrument)));
    this.similarArtists.forEach(artists => artists.forEach(artist => allSimilarArtists.add(artist)));

    const playlistTrackIds = new Set(Array.from(this.genres.keys()));

    playlistTrackIds.forEach(trackId => {
      let score = 0;
      let matchDetails = {
        genres: [] as string[],
        influences: [] as string[],
        styles: [] as string[],
        instruments: [] as string[],
        similarArtists: [] as string[],
        artistInfo: this.artistInfo.get(trackId) || {},
        matchingFactors: [] as string[]
      };

      const trackGenres = this.genres.get(trackId) || new Set();
      trackGenres.forEach(genre => {
        if (allGenres.has(genre)) {
          score += 2;
          matchDetails.genres.push(genre);
          matchDetails.matchingFactors.push(`Genre musical: ${genre}`);
        }
      });

      const trackInfluences = this.influences.get(trackId) || new Set();
      trackInfluences.forEach(influence => {
        if (allInfluences.has(influence)) {
          score += 1.5;
          matchDetails.influences.push(influence);
          matchDetails.matchingFactors.push(`Influence: ${influence}`);
        }
      });

      const trackStyles = this.styles.get(trackId) || new Set();
      trackStyles.forEach(style => {
        if (allStyles.has(style)) {
          score += 1.5;
          matchDetails.styles.push(style);
          matchDetails.matchingFactors.push(`Style musical: ${style}`);
        }
      });

      const trackInstruments = this.instruments.get(trackId) || new Set();
      trackInstruments.forEach(instrument => {
        if (allInstruments.has(instrument)) {
          score += 1;
          matchDetails.instruments.push(instrument);
          matchDetails.matchingFactors.push(`Instrument: ${instrument}`);
        }
      });

      const trackSimilarArtists = this.similarArtists.get(trackId) || new Set();
      trackSimilarArtists.forEach(artist => {
        if (allSimilarArtists.has(artist)) {
          score += 2;
          matchDetails.similarArtists.push(artist);
          matchDetails.matchingFactors.push(`Artiste similaire: ${artist}`);
        }
      });

      if (score > 0) {
        const artistInfo = this.artistInfo.get(trackId);
        recommendations.push({
          id: trackId,
          score,
          matchDetails,
          name: `Recommandation basée sur ${matchDetails.matchingFactors.length} facteurs communs`,
          description: `Cette recommandation est basée sur ${matchDetails.genres.length} genres, ${matchDetails.influences.length} influences, ${matchDetails.styles.length} styles musicaux, ${matchDetails.instruments.length} instruments communs et ${matchDetails.similarArtists.length} artistes similaires.`,
          artistInfo
        });
      }
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
}