# 🎵 Musify — Modern Web Music Player

A sleek, responsive, modern music player inspired by Spotify, featuring a vibrant red dark-mode aesthetic, real-time audio spectrum visualizer, queue management, volume controls, and drag-and-drop local audio file support. Built entirely with vanilla **HTML5**, **CSS3**, and **JavaScript (ES6+)**.

---

## ✨ Features

- **▶️ Complete Playback Controls**: Play, pause, skip next, rewind previous with smart track restarting.
- **🔀 Shuffle & Repeat Modes**: Supports random shuffle and multi-state repeat (Off, Repeat All, Repeat Current Track).
- **🎨 Dynamic Ambient Stage**:
  - Blurred dynamic background that adapts to match current album artwork.
  - Interactive spinning vinyl disc that slides out during playback.
  - Ambient red audio pulse and pulsing artwork shadow.
- **📊 Real-time Audio Spectrum Visualizer**: Animated canvas audio frequency visualizer reactive to bass and rhythmic beat pulses.
- **⏱️ Interactive Scrubber / Seek Bar**:
  - Live elapsed time & total duration tracking.
  - Click-and-drag seek scrubbing.
  - Hover tooltip with exact timestamp preview.
- **🔊 Volume Controls & Mute**: Draggable slider with volume percentage, dynamic speaker icons, and one-click mute/unmute with persistent memory.
- **📜 Interactive Playlist & Queue**:
  - Track numbers, album thumbnails, titles, artists, and durations.
  - **Live search filter** to instantly search songs by title or artist.
  - Active playing track indicator with animated 3-bar soundwave equalizer.
  - Like / favorite heart toggle with local storage persistence.
  - Shuffle playlist order button and individual track removal.
- **📂 Local Audio Import (Drag & Drop)**: Import and immediately play any local audio files (`.mp3`, `.wav`, `.ogg`, `.flac`) directly via file selector or by dropping files onto the browser window.
- **⚡ Autoplay**: Automatically queues and plays the next song when the current track finishes.
- **🛡️ Offline Fallback**: Built-in Web Audio procedural ambient synthesizer ensures audio playback never fails even if offline or network streams are unreachable.
- **📱 Fully Responsive**: Fluid adaptive layout optimized for desktop, tablet, and mobile displays.
- **⌨️ Keyboard Shortcuts**: Complete keyboard navigation for power users.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Play / Pause |
| <kbd>→</kbd> / <kbd>←</kbd> | Seek forward / backward 5 seconds |
| <kbd>N</kbd> / <kbd>P</kbd> | Next / Previous song |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Volume Up / Down 5% |
| <kbd>M</kbd> | Mute / Unmute |
| <kbd>S</kbd> | Toggle Shuffle mode |
| <kbd>R</kbd> | Cycle Repeat mode (Off $\rightarrow$ All $\rightarrow$ One) |
| <kbd>L</kbd> | Like / Favorite current song |

---

## 🛠️ Built With

- **HTML5**: Semantic tags, native `<audio>` API, inline SVG vector graphics, and File API.
- **CSS3**: Modern CSS Variables, Flexbox, CSS Grid, Glassmorphism (`backdrop-filter`), keyframe animations (`@keyframes`), and responsive media queries.
- **JavaScript (ES6+)**: Audio controller, Canvas 2D spectrum visualizer, drag-and-drop file readers, and `localStorage` state persistence.

---

## 🚀 How to Run Locally

1. Clone or download this repository.
2. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
3. No build tools, servers, or npm dependencies required!

---

## 🌐 Deploy to GitHub Pages (Free Hosting)

1. In your GitHub repository, go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Branch**, select `main` (or `master`) and folder `/ (root)`.
3. Click **Save**. Within 1–2 minutes, your Musify player will be live on the web at `https://<your-username>.github.io/<repo-name>/`!
