/**
 * Sargam Web - User Interface & Render Engine
 * Handles view switching, dynamic rendering, real-time Audius search, and playback.
 */

const UI = {
  activeView: 'home',
  searchDebounceTimer: null,

  init() {
    this.renderCategoriesGrid();
    this.renderAllCategoriesView();
    this.renderLibraryView();
    this.setupEventListeners();
    this.loadManifestUpdateInfo();
  },

  async loadManifestUpdateInfo() {
    try {
      const res = await fetch('./update.json');
      if (res.ok) {
        const data = await res.json();
        if (data && data.apkUrl) {
          document.querySelectorAll('a[download]').forEach(link => {
            link.href = data.apkUrl;
          });
        }
      }
    } catch (e) {
      console.log('Manifest update check info:', e);
    }
  },

  // Switch navigation view
  switchView(viewName) {
    this.activeView = viewName;

    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.mobile-nav-item').forEach(item => item.classList.remove('active'));

    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) targetSection.classList.add('active');

    const activeNavs = document.querySelectorAll(`[data-view="${viewName}"]`);
    activeNavs.forEach(nav => nav.classList.add('active'));

    // Auto-scroll main container to top
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.scrollTop = 0;
  },

  // Fetch and render live Trending Tracks from Audius API
  async loadTrendingContent() {
    const songsListContainer = document.getElementById('trending-songs-list');
    if (songsListContainer) {
      songsListContainer.innerHTML = `
        <div style="color: var(--text-muted); padding: 24px; text-align: center;">
          <span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> Loading trending tracks...
        </div>`;
    }

    try {
      const tracks = await AudiusAPI.getTrendingTracks(20);
      if (tracks && tracks.length > 0) {
        SARGAM_TRACKS = tracks;
        this.renderTrendingSongs(tracks);

        // Load initial top track into player bar without autoplay
        if (player && (!player.currentTrack || !player.isPlaying)) {
          player.queue = [...SARGAM_TRACKS];
          player.currentIndex = 0;
          player.loadTrack(SARGAM_TRACKS[0], false);
        }
      } else {
        if (songsListContainer) {
          songsListContainer.innerHTML = `
            <div style="color: var(--text-muted); padding: 20px; text-align: center;">
              Unable to load tracks right now. Please check your network connection and refresh.
            </div>`;
        }
      }
    } catch (err) {
      console.error('Error loading trending content:', err);
      if (songsListContainer) {
        songsListContainer.innerHTML = `
          <div style="color: var(--text-muted); padding: 20px; text-align: center;">
            Error connecting to music service.
          </div>`;
      }
    }

    this.renderFeaturedPlaylists();
  },

  renderTrendingSongs(tracks) {
    const songsListContainer = document.getElementById('trending-songs-list');
    if (songsListContainer) {
      if (!tracks || tracks.length === 0) {
        songsListContainer.innerHTML = `<div style="color: var(--text-muted); padding: 20px;">No tracks found.</div>`;
        return;
      }
      songsListContainer.innerHTML = tracks.slice(0, 10).map((song, idx) => this.createSongRowHtml(song, idx + 1)).join('');
    }
  },

  renderFeaturedPlaylists() {
    const playlistsGrid = document.getElementById('featured-playlists-grid');
    if (playlistsGrid) {
      playlistsGrid.innerHTML = DEMO_PLAYLISTS.map(pl => `
        <div class="music-card" onclick="UI.playPlaylist('${pl.id}')">
          <div class="card-img-wrapper">
            <img src="${pl.cover}" alt="${pl.title}" />
            <div class="card-play-btn">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="card-info">
            <div class="card-title">${pl.title}</div>
            <div class="card-subtitle">${pl.description}</div>
          </div>
        </div>
      `).join('');
    }
  },

  renderCategoriesGrid() {
    const categoriesGrid = document.getElementById('browse-categories-grid');
    if (categoriesGrid) {
      categoriesGrid.innerHTML = MUSIC_CATEGORIES.map(cat => `
        <div class="category-card"
             style="background: linear-gradient(135deg, ${cat.color1}, ${cat.color2});"
             onclick="UI.filterByCategory('${cat.query || cat.name}')">
          <div class="category-title">${cat.name}</div>
          <div class="category-icon">${cat.icon}</div>
        </div>
      `).join('');
    }
  },

  renderAllCategoriesView() {
    const allCatGrid = document.getElementById('all-categories-grid');
    if (allCatGrid) {
      allCatGrid.innerHTML = MUSIC_CATEGORIES.map(cat => `
        <div class="category-card"
             style="background: linear-gradient(135deg, ${cat.color1}, ${cat.color2});"
             onclick="UI.filterByCategory('${cat.query || cat.name}')">
          <div class="category-title">${cat.name}</div>
          <div class="category-icon">${cat.icon}</div>
        </div>
      `).join('');
    }
  },

  renderLibraryView() {
    const likedListContainer = document.getElementById('liked-songs-list');
    if (likedListContainer) {
      if (LIKED_TRACKS.length === 0) {
        likedListContainer.innerHTML = `<div style="color: var(--text-muted); padding: 20px;">No liked songs yet. Click the heart icon on any song to add it to your library!</div>`;
      } else {
        likedListContainer.innerHTML = LIKED_TRACKS.map((song, idx) => this.createSongRowHtml(song, idx + 1)).join('');
      }
    }
  },

  // Helper: Song Row HTML Generator
  createSongRowHtml(song, index) {
    const isPlaying = player.currentTrack && player.currentTrack.id === song.id;
    const isLiked = LIKED_TRACKS.some(t => t.id === song.id);

    return `
      <div class="song-row ${isPlaying ? 'playing' : ''}" data-song-id="${song.id}" onclick="UI.playTrackById('${song.id}')">
        <div class="song-index">${index}</div>
        <div class="song-details">
          <img class="song-thumb" src="${song.cover}" alt="${this.escapeHtml(song.title)}" onError="this.src='./assets/logo.svg'" />
          <div class="song-meta">
            <div class="song-name">${this.escapeHtml(song.title)}</div>
            <div class="song-artist">${this.escapeHtml(song.artist)}</div>
          </div>
        </div>
        <div class="song-album">${this.escapeHtml(song.album || 'Single')}</div>
        <div class="song-duration">${song.duration}</div>
        <button class="song-like-btn ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); UI.toggleLikeTrack('${song.id}')">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>
    `;
  },

  // Event Handlers for Play Actions
  playTrackById(songId) {
    let trackIndex = SARGAM_TRACKS.findIndex(s => s.id === songId);
    if (trackIndex >= 0) {
      player.setQueue(SARGAM_TRACKS, trackIndex);
    } else {
      let likedTrack = LIKED_TRACKS.find(s => s.id === songId);
      if (likedTrack) {
        player.setQueue([likedTrack], 0);
      }
    }
  },

  async playPlaylist(playlistId) {
    const pl = DEMO_PLAYLISTS.find(p => p.id === playlistId);
    if (pl) {
      this.switchView('search');
      const searchInput = document.getElementById('main-search-input');
      if (searchInput) searchInput.value = pl.query || pl.title;
      await this.handleSearch(pl.query || pl.title);
      if (SARGAM_TRACKS.length > 0) {
        player.setQueue(SARGAM_TRACKS, 0);
      }
    }
  },

  playAllTrending() {
    if (SARGAM_TRACKS.length > 0) {
      player.setQueue(SARGAM_TRACKS, 0);
    }
  },

  toggleLikeTrack(songId) {
    const track = SARGAM_TRACKS.find(s => s.id === songId) || LIKED_TRACKS.find(s => s.id === songId);
    if (!track) return;

    const likedIndex = LIKED_TRACKS.findIndex(t => t.id === songId);
    if (likedIndex >= 0) {
      LIKED_TRACKS.splice(likedIndex, 1);
    } else {
      LIKED_TRACKS.push(track);
    }

    this.renderTrendingSongs(SARGAM_TRACKS);
    this.renderLibraryView();
  },

  // Real-time Search Logic using Audius Engine
  handleSearch(query) {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);

    const cleanQuery = query.trim();
    if (!cleanQuery) {
      document.getElementById('search-results-section').style.display = 'none';
      document.getElementById('browse-categories-section').style.display = 'block';
      return;
    }

    document.getElementById('browse-categories-section').style.display = 'none';
    const resultsSec = document.getElementById('search-results-section');
    resultsSec.style.display = 'block';

    const resultsContainer = document.getElementById('search-songs-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = `<div style="color: var(--text-muted); padding: 16px;">Searching Sargam for "${this.escapeHtml(cleanQuery)}"...</div>`;
    }

    this.searchDebounceTimer = setTimeout(async () => {
      try {
        const results = await AudiusAPI.searchTracks(cleanQuery, 20);
        if (resultsContainer) {
          if (!results || results.length === 0) {
            resultsContainer.innerHTML = `<div style="color: var(--text-muted); padding: 16px;">No songs found for "${this.escapeHtml(cleanQuery)}". Try searching another track title or artist.</div>`;
          } else {
            // Update active track list so clicking plays from search results
            SARGAM_TRACKS = results;
            resultsContainer.innerHTML = results.map((song, idx) => this.createSongRowHtml(song, idx + 1)).join('');
          }
        }
      } catch (err) {
        console.error('Search error:', err);
        if (resultsContainer) {
          resultsContainer.innerHTML = `<div style="color: var(--text-muted); padding: 16px;">Error fetching search results. Please check your internet connection.</div>`;
        }
      }
    }, 350);
  },

  filterByCategory(categoryQuery) {
    this.switchView('search');
    const searchInput = document.getElementById('main-search-input');
    if (searchInput) {
      searchInput.value = categoryQuery;
      this.handleSearch(categoryQuery);
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  // Web Share API & Clipboard Fallback Implementation
  async shareSargam() {
    const shareData = {
      title: 'Sargam Web',
      text: 'Sargam \u2013 Music for everyone \uD83C\uDFB5\nHindi \u2022 Bhojpuri \u2022 Haryanvi \u2022 Punjabi \u2022 English & more',
      url: 'https://sauravmishraa05-art.github.io/sargam/'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          this.copyShareLinkToClipboard();
        }
      }
    } else {
      this.copyShareLinkToClipboard();
    }
  },

  copyShareLinkToClipboard() {
    const urlToCopy = 'https://sauravmishraa05-art.github.io/sargam/';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(urlToCopy).then(() => {
        this.showToast('Link copied to clipboard!');
      }).catch(() => {
        this.fallbackCopyTextToClipboard(urlToCopy);
      });
    } else {
      this.fallbackCopyTextToClipboard(urlToCopy);
    }
  },

  fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      this.showToast('Link copied to clipboard!');
    } catch (err) {
      this.showToast('https://sauravmishraa05-art.github.io/sargam/');
    }
    document.body.removeChild(textArea);
  },

  showToast(msg) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  },

  setupEventListeners() {
    // Navigation items click
    document.querySelectorAll('[data-view]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        this.switchView(view);
      });
    });

    // Share buttons click
    document.querySelectorAll('.btn-share-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.shareSargam();
      });
    });

    // Main search input
    const searchInput = document.getElementById('main-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Player Progress bar click
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = (clickX / rect.width) * 100;
        player.seekTo(percent);
      });
    }

    // Player Control Buttons
    const btnPlayPause = document.getElementById('btn-play-pause');
    if (btnPlayPause) btnPlayPause.addEventListener('click', () => player.togglePlayPause());

    const btnNext = document.getElementById('btn-next');
    if (btnNext) btnNext.addEventListener('click', () => player.nextTrack());

    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) btnPrev.addEventListener('click', () => player.previousTrack());

    const btnShuffle = document.getElementById('btn-shuffle');
    if (btnShuffle) btnShuffle.addEventListener('click', () => player.toggleShuffle());

    const btnRepeat = document.getElementById('btn-repeat');
    if (btnRepeat) btnRepeat.addEventListener('click', () => player.toggleRepeat());

    // Volume slider
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        player.setVolume(parseFloat(e.target.value));
      });
    }
  }
};
