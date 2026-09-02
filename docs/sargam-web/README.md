# Sargam Web - Modern Music Streaming Web Application

**Sargam Web** is a Spotify-inspired, dark-themed responsive web application designed for mobile and desktop web browsers, powered by the **Audius Music Engine**.

---

## 🌟 Key Features

- **Audius Music Engine**:
  - Live streaming of full-length songs with real audio sources.
- **Real-Time Live Search**:
  - Search for full-length songs by track title, artist name, language, or album.
- **Made For You & Regional Collections**:
  - Featured cards for Hindi Hits 2025, Punjabi Hits, Bhojpuri Superhits, and Haryanvi Beats.
- **Sargam Branding & Visual Identity**:
  - Custom SVG vector logo, sleek glassmorphism design, and dark theme palette.
- **Complete Audio Player**:
  - Track artwork cover, title, artist, and duration metadata display.
  - Interactive controls: Play/Pause, Next, Previous, Seek Progressbar, Volume Slider, Shuffle, and Repeat.
  - Automatic audio error handling (skips unplayable streams gracefully).
- **Isolated Music Provider Module (`js/audius.js`)**:
  - Standardized provider API module interface.
- **Sargam Android APK Download Hub**:
  - Benefits overview and direct link to download the Sargam Android FOSS APK file.
- **Mobile Responsive Navigation**:
  - Bottom navigation bar for mobile screen sizes (Home, Search, Library, Get App).

---

## 📁 Project Structure

```
sargam-web/
├── index.html        # Main HTML layout & view sections
├── css/
│   └── style.css     # Dark mode theme, glassmorphism, mobile media queries
├── js/
│   ├── audius.js     # Isolated Audius API engine (search, trending tracks, streaming)
│   ├── data.js       # Active track state & playlist collections
│   ├── player.js     # Audio playback manager (HTML5 audio, seek, volume, queue)
│   ├── ui.js         # Navigation, view rendering, debounced real-time search
│   └── app.js        # Entry point script
├── assets/
│   └── logo.svg      # Sargam brand SVG vector logo
└── README.md         # Documentation
```

---

## 🚀 How to Run Locally

Since Sargam Web is built with clean static HTML, CSS, and JavaScript, you can run it immediately without complex server setups or build tools!

### Option 1: Direct File Opening (Easiest)
1. Open your file explorer and navigate to:
   `C:\Users\mishr\Downloads\Meld-main\Meld-main\sargam-web\`
2. Double click `index.html` to open it in your browser (Chrome, Firefox, Edge, Safari).

### Option 2: Live Local HTTP Server (Recommended for Web APIs)
Using Python or Node.js in terminal/command prompt:

**Python:**
```bash
cd C:\Users\mishr\Downloads\Meld-main\Meld-main\sargam-web
python -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

**Node.js / npx:**
```bash
cd C:\Users\mishr\Downloads\Meld-main\Meld-main\sargam-web
npx http-server -p 8080
```
Then visit `http://localhost:8080` in your browser.
