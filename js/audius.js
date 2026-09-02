/**
 * Sargam Web - Audius API Integration Module
 * Handles API discovery, searching, trending track fetching, and streaming URL resolution.
 * Isolated module so music providers can be swapped easily in the future.
 */

const AudiusAPI = {
  appName: 'SargamWeb',
  defaultHosts: [
    'https://discoveryprovider.audius.co',
    'https://audius-discovery-1.falco-subnets.com',
    'https://discovery-us-01.audius.openindex.network'
  ],
  currentHost: 'https://discoveryprovider.audius.co',
  isInitialized: false,

  /**
   * Initializes host discovery to select an active, working Audius node.
   */
  async initHost() {
    if (this.isInitialized) return this.currentHost;

    try {
      const response = await fetch('https://api.audius.co', { cache: 'no-cache' });
      if (response.ok) {
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
          // Select a random working host from returned host array
          const randomHost = data.data[Math.floor(Math.random() * data.data.length)];
          if (randomHost) {
            this.currentHost = randomHost;
          }
        }
      }
    } catch (e) {
      console.warn('Audius host discovery fallback to default:', e);
      this.currentHost = this.defaultHosts[0];
    }

    this.isInitialized = true;
    return this.currentHost;
  },

  /**
   * Fetches trending tracks from Audius.
   */
  async getTrendingTracks(limit = 20) {
    await this.initHost();
    const url = `${this.currentHost}/v1/tracks/trending?app_name=${this.appName}&limit=${limit}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.length > 0) {
          return json.data.map(t => this.formatTrack(t)).filter(t => t && t.audioUrl);
        }
      }
    } catch (err) {
      console.error('Error fetching trending tracks from Audius:', err);
    }
    return [];
  },

  /**
   * Searches tracks on Audius by query string (artist name, track title, genre).
   * Includes smart fallback so queries like "Hindi Hits 2025" always return playable tracks.
   */
  async searchTracks(query, limit = 20) {
    if (!query || !query.trim()) return [];
    await this.initHost();

    const cleanQuery = encodeURIComponent(query.trim());
    const url = `${this.currentHost}/v1/tracks/search?query=${cleanQuery}&app_name=${this.appName}&limit=${limit}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.length > 0) {
          return json.data.map(t => this.formatTrack(t)).filter(t => t && t.audioUrl);
        }
      }
    } catch (err) {
      console.error('Error searching tracks on Audius:', err);
    }

    // Fallback 1: Try searching using the first keyword (e.g. "Hindi" from "Hindi Hits 2025")
    const words = query.trim().split(' ');
    if (words.length > 1) {
      const firstWord = encodeURIComponent(words[0]);
      try {
        const fallbackUrl = `${this.currentHost}/v1/tracks/search?query=${firstWord}&app_name=${this.appName}&limit=${limit}`;
        const res = await fetch(fallbackUrl);
        if (res.ok) {
          const json = await res.json();
          if (json && json.data && json.data.length > 0) {
            return json.data.map(t => this.formatTrack(t)).filter(t => t && t.audioUrl);
          }
        }
      } catch (e) {
        console.warn('Keyword fallback search error:', e);
      }
    }

    // Fallback 2: Return trending tracks so user always gets playable full-length tracks
    return await this.getTrendingTracks(limit);
  },

  /**
   * Gets direct stream URL for an Audius track ID.
   */
  getStreamUrl(trackId) {
    return `${this.currentHost}/v1/tracks/${trackId}/stream?app_name=${this.appName}`;
  },

  /**
   * Formats raw Audius track JSON into Sargam Web standardized track schema.
   */
  formatTrack(t) {
    if (!t || !t.id) return null;

    const streamUrl = this.getStreamUrl(t.id);
    const coverUrl = (t.artwork && (t.artwork['480x480'] || t.artwork['150x150'] || t.artwork['1000x1000'])) || './assets/logo.svg';

    return {
      id: `audius-${t.id}`,
      audiusId: t.id,
      title: t.title || 'Untitled Track',
      artist: (t.user && t.user.name) ? t.user.name : 'Unknown Artist',
      artistId: (t.user && t.user.id) ? `art-${t.user.id}` : '',
      album: 'Audius Release',
      albumId: 'alb-audius',
      durationSec: t.duration || 180,
      duration: this.formatSeconds(t.duration || 180),
      cover: coverUrl,
      audioUrl: streamUrl,
      genre: t.genre || 'Music',
      isLiked: false,
      plays: t.play_count ? t.play_count.toLocaleString() : '0'
    };
  },

  /**
   * Helper to format seconds into M:SS display.
   */
  formatSeconds(secs) {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
};
