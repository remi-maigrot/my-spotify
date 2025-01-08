export interface Track {
  id: string;
  name: string;
  artists: Array<{
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