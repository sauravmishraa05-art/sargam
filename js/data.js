/**
 * Sargam Web - Music Data Management
 * Manages active track datasets, categories, and playlists using the Audius Music Engine.
 */

// Global state holding dynamically loaded full-length songs
let SARGAM_TRACKS = [];
let LIKED_TRACKS = [];

// Helper SVG Cover Art Generator for fallback visuals
function generateCoverArt(title, subtitle, color1 = '#8B5CF6', color2 = '#06B6D4') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
      <filter id="f"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.3"/></filter>
    </defs>
    <rect width="300" height="300" fill="url(#g)"/>
    <circle cx="150" cy="120" r="60" fill="#ffffff" opacity="0.15" filter="url(#f)"/>
    <path d="M135 95 L180 120 L135 145 Z" fill="#ffffff" opacity="0.9"/>
    <text x="150" y="210" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="20" fill="#ffffff" text-anchor="middle">${title}</text>
    <text x="150" y="235" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="14" fill="#ffffff" opacity="0.8" text-anchor="middle">${subtitle}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Categories / Genres (Including Hindi, Punjabi, Bhojpuri, Haryanvi)
const MUSIC_CATEGORIES = [
  { id: 'cat-hindi', name: 'Hindi Hits 2025', query: 'Hindi Hits 2025', color1: '#EF4444', color2: '#EC4899', icon: '🔥' },
  { id: 'cat-punjabi', name: 'Punjabi Hits', query: 'Punjabi Hits', color1: '#F59E0B', color2: '#D97706', icon: '🕺' },
  { id: 'cat-bhojpuri', name: 'Bhojpuri Superhits', query: 'Bhojpuri Superhits', color1: '#10B981', color2: '#059669', icon: '💃' },
  { id: 'cat-haryanvi', name: 'Haryanvi Beats', query: 'Haryanvi Beats', color1: '#8B5CF6', color2: '#6366F1', icon: '🎧' },
  { id: 'cat-english', name: 'English Pop', query: 'Pop Hits', color1: '#06B6D4', color2: '#3B82F6', icon: '⚡' },
  { id: 'cat-lofi', name: 'Lo-Fi & Chill', query: 'Lo-Fi Chill', color1: '#6366F1', color2: '#1E1B4B', icon: '🌙' },
  { id: 'cat-ambient', name: 'Acoustic & Ambient', query: 'Acoustic Ambient', color1: '#84CC16', color2: '#10B981', icon: '🎸' }
];

// Featured Playlists / Made For You Cards
const DEMO_PLAYLISTS = [
  {
    id: 'pl-hindi',
    title: 'Hindi Top Trending',
    query: 'Hindi Hits 2025',
    description: 'Top chart-busting Hindi tracks across India.',
    cover: generateCoverArt('Hindi', 'Top Trending', '#EF4444', '#EC4899')
  },
  {
    id: 'pl-punjabi',
    title: 'Punjabi Pop Explosion',
    query: 'Punjabi Hits',
    description: 'High-energy Punjabi club tracks and party bangers.',
    cover: generateCoverArt('Punjabi', 'Pop Explosion', '#F59E0B', '#10B981')
  },
  {
    id: 'pl-bhojpuri',
    title: 'Bhojpuri Dhamaka',
    query: 'Bhojpuri Superhits',
    description: 'Trending Bhojpuri chartbusters and dance hits.',
    cover: generateCoverArt('Bhojpuri', 'Dhamaka', '#10B981', '#06B6D4')
  },
  {
    id: 'pl-haryanvi',
    title: 'Haryanvi High Voltage',
    query: 'Haryanvi Beats',
    description: 'Bass-boosted Haryanvi beats and youth anthems.',
    cover: generateCoverArt('Haryanvi', 'High Voltage', '#8B5CF6', '#6366F1')
  }
];
