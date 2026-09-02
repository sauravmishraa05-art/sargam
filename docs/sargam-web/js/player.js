/**
 * Sargam Web - Audio Player Manager
 * Manages audio element playback, play queue, seeking, volume, and playback state.
 */

class MusicPlayer {
  constructor() {
    this.audio = new Audio();
    this.currentTrack = null;
    this.queue = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.isShuffle = false;
    this.isRepeat = false;

    this.initListeners();
  }

  initListeners() {
    // Time update listener for progress bar
    this.audio.addEventListener('timeupdate', () => {
      if (!isNaN(this.audio.duration) && this.audio.duration > 0) {
        const progressPercent = (this.audio.currentTime / this.audio.duration) * 100;
        this.updateProgressUI(this.audio.currentTime, this.audio.duration, progressPercent);
      }
    });

    // Track ended listener
    this.audio.addEventListener('ended', () => {
      if (this.isRepeat) {
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        this.nextTrack();
      }
    });

    // Error handler
    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error fallback handled:', e);
      // Advance to next track if error occurs
      this.nextTrack();
    });
  }

  loadTrack(track, autoPlay = true) {
    if (!track) return;
    this.currentTrack = track;
    this.audio.src = track.audioUrl;
    this.audio.load();

    this.updatePlayerInfoUI(track);

    if (autoPlay) {
      this.playTrack();
    }
  }

  playTrack() {
    if (!this.currentTrack && this.queue.length > 0) {
      this.loadTrack(this.queue[0], true);
      return;
    }
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updatePlayPauseUI(true);
      this.highlightPlayingSongInList();
    }).catch(err => {
      console.warn('Playback interrupted:', err);
    });
  }

  pauseTrack() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayPauseUI(false);
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pauseTrack();
    } else {
      this.playTrack();
    }
  }

  nextTrack() {
    if (this.queue.length === 0) return;
    if (this.isShuffle) {
      this.currentIndex = Math.floor(Math.random() * this.queue.length);
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.queue.length;
    }
    this.loadTrack(this.queue[this.currentIndex], true);
  }

  previousTrack() {
    if (this.queue.length === 0) return;
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }
    this.currentIndex = (this.currentIndex - 1 + this.queue.length) % this.queue.length;
    this.loadTrack(this.queue[this.currentIndex], true);
  }

  seekTo(percent) {
    if (this.audio.duration) {
      this.audio.currentTime = (percent / 100) * this.audio.duration;
    }
  }

  setVolume(volumeVal) {
    // volumeVal expected between 0.0 and 1.0
    this.audio.volume = Math.max(0, Math.min(1, volumeVal));
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    const btn = document.getElementById('btn-shuffle');
    if (btn) btn.classList.toggle('active', this.isShuffle);
  }

  toggleRepeat() {
    this.isRepeat = !this.isRepeat;
    const btn = document.getElementById('btn-repeat');
    if (btn) btn.classList.toggle('active', this.isRepeat);
  }

  setQueue(songs, startIndex = 0) {
    this.queue = songs;
    this.currentIndex = startIndex;
    if (this.queue.length > 0) {
      this.loadTrack(this.queue[startIndex], true);
    }
  }

  /* UI Sync Helpers */
  updatePlayerInfoUI(track) {
    const cover = document.getElementById('player-cover');
    const title = document.getElementById('player-title');
    const artist = document.getElementById('player-artist');

    if (cover) cover.src = track.cover;
    if (title) title.textContent = track.title;
    if (artist) artist.textContent = track.artist;
  }

  updatePlayPauseUI(playing) {
    const playBtnSvg = document.querySelector('#btn-play-pause svg');
    if (playBtnSvg) {
      if (playing) {
        // Pause icon
        playBtnSvg.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
      } else {
        // Play icon
        playBtnSvg.innerHTML = `<path d="M8 5v14l11-7z"/>`;
      }
    }
  }

  updateProgressUI(currentTime, duration, percent) {
    const fill = document.getElementById('progress-fill');
    const currTimeLabel = document.getElementById('curr-time');
    const durTimeLabel = document.getElementById('dur-time');

    if (fill) fill.style.width = `${percent}%`;
    if (currTimeLabel) currTimeLabel.textContent = this.formatTime(currentTime);
    if (durTimeLabel) durTimeLabel.textContent = this.formatTime(duration);
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  highlightPlayingSongInList() {
    document.querySelectorAll('.song-row').forEach(row => {
      row.classList.remove('playing');
      if (this.currentTrack && row.dataset.songId === this.currentTrack.id) {
        row.classList.add('playing');
      }
    });
  }
}

// Global Player Instance
const player = new MusicPlayer();
