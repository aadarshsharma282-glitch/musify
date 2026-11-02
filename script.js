/**
 * Musify Web Player - Modern Interactive Music Player
 * Handles playback, audio streaming, playlist queue, seeking, volume,
 * Web Audio visualizer, drag-and-drop file import, keyboard shortcuts, and responsiveness.
 */

// =============================================================================
// 1. Initial Playlist Data (Curated Royalty-Free Sample Tracks)
// =============================================================================
const INITIAL_TRACKS = [
  {
    id: "track-1",
    title: "Celestial Echoes",
    artist: "Aetheria",
    album: "Neon Drift",
    duration: "6:12",
    durationSec: 372,
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    liked: false
  },
  {
    id: "track-2",
    title: "Midnight Skyline",
    artist: "Kavinsky Sound",
    album: "Synthwave Odyssey",
    duration: "7:05",
    durationSec: 425,
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    liked: true
  },
  {
    id: "track-3",
    title: "Solar Flares",
    artist: "Astral Waves",
    album: "Galactic Horizons",
    duration: "5:44",
    durationSec: 344,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    liked: false
  },
  {
    id: "track-4",
    title: "Velvet Groove",
    artist: "The Lowkey Quintet",
    album: "After Hours Chill",
    duration: "5:02",
    durationSec: 302,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    liked: false
  },
  {
    id: "track-5",
    title: "Urban Reverie",
    artist: "Subtle Sparks",
    album: "Lo-Fi Coffee Sessions",
    duration: "4:38",
    durationSec: 278,
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    liked: true
  }
];

// =============================================================================
// 2. State Management
// =============================================================================
const state = {
  playlist: [...INITIAL_TRACKS],
  filteredIndices: [], // For search filtering
  currentIndex: 0,
  isPlaying: false,
  isShuffle: false,
  repeatMode: "off", // 'off' | 'all' | 'one'
  volume: 0.8,
  isMuted: false,
  isSeeking: false,
  history: [], // For previous track navigation in shuffle
  favorites: new Set(JSON.parse(localStorage.getItem("musify_liked_tracks") || localStorage.getItem("spotify_liked_tracks") || "[\"track-2\", \"track-5\"]"))
};

// =============================================================================
// 3. DOM Element References
// =============================================================================
const appContainer = document.querySelector(".app-container");
const audio = document.getElementById("audio-element");

// Main Card Elements
const albumArt = document.getElementById("album-art");
const stageBackdrop = document.getElementById("stage-backdrop");
const trackTitle = document.getElementById("track-title");
const trackArtist = document.getElementById("track-artist");
const trackAlbum = document.getElementById("track-album");
const likeBtn = document.getElementById("like-btn");

// Mini Bar Elements
const miniArt = document.getElementById("mini-art");
const miniTitle = document.getElementById("mini-title");
const miniArtist = document.getElementById("mini-artist");
const miniLikeBtn = document.getElementById("mini-like-btn");

// Control Buttons
const playPauseBtn = document.getElementById("play-pause-btn");
const playIcon = document.getElementById("play-icon");
const pauseIcon = document.getElementById("pause-icon");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");
const repeatOneBadge = document.getElementById("repeat-one-badge");

// Scrubber Progress Bar
const progressWrapper = document.getElementById("progress-wrapper");
const progressFill = document.getElementById("progress-fill");
const progressHandle = document.getElementById("progress-handle");
const progressBuffer = document.getElementById("progress-buffer");
const progressTooltip = document.getElementById("progress-tooltip");
const currentTimeLabel = document.getElementById("current-time");
const durationTimeLabel = document.getElementById("duration-time");

// Volume Controls
const volumeBtn = document.getElementById("volume-icon-btn");
const volHigh = document.getElementById("vol-high");
const volLow = document.getElementById("vol-low");
const volMuted = document.getElementById("vol-muted");
const volumeWrapper = document.getElementById("volume-wrapper");
const volumeFill = document.getElementById("volume-fill");
const volumeHandle = document.getElementById("volume-handle");
const volumePercentage = document.getElementById("volume-percentage");

// Playlist & Search
const playlistTracksEl = document.getElementById("playlist-tracks");
const playlistContainer = document.getElementById("playlist-container");
const songCountEl = document.getElementById("song-count");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search");
const noResultsEl = document.getElementById("no-results");
const shufflePlaylistBtn = document.getElementById("shuffle-playlist-btn");
const dropZone = document.getElementById("drop-zone");
const fileUpload = document.getElementById("file-upload");
const playlistToggleBtn = document.getElementById("playlist-toggle-btn");
const toastContainer = document.getElementById("toast-container");

function showToast(message, type = "success") {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type === "info" ? "toast-info" : ""}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 2600);
}

// Modal & Canvas Visualizer
const shortcutsBtn = document.getElementById("shortcuts-btn");
const shortcutsModal = document.getElementById("shortcuts-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const visualizerCanvas = document.getElementById("visualizer-canvas");
const canvasCtx = visualizerCanvas.getContext("2d");

// =============================================================================
// 4. Web Audio API Setup & Visualizer
// =============================================================================
let audioContext = null;
let analyserNode = null;
let audioSourceNode = null;
let visualizerAnimationId = null;

function initAudioVisualizer() {
  const currentTrack = state.playlist[state.currentIndex];
  if (!currentTrack || !currentTrack.url.startsWith("blob:")) {
    // Use procedural frequency visualizer to guarantee cross-origin audio never mutes
    return;
  }
  if (audioContext) return;
  try {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return;

    audioContext = new AudioCtxClass();
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 64;

    audioSourceNode = audioContext.createMediaElementSource(audio);
    audioSourceNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);
  } catch (err) {
    console.warn("Visualizer fallback:", err.message);
  }
}

function resizeVisualizerCanvas() {
  visualizerCanvas.width = visualizerCanvas.parentElement.clientWidth * window.devicePixelRatio;
  visualizerCanvas.height = visualizerCanvas.parentElement.clientHeight * window.devicePixelRatio;
  canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

function drawVisualizer() {
  visualizerAnimationId = requestAnimationFrame(drawVisualizer);

  const width = visualizerCanvas.parentElement.clientWidth;
  const height = visualizerCanvas.parentElement.clientHeight;
  canvasCtx.clearRect(0, 0, width, height);

  const numBars = 32;
  const barWidth = 3;
  const gap = (width - (numBars * barWidth)) / (numBars - 1);

  let frequencies = new Uint8Array(numBars);

  if (analyserNode && state.isPlaying) {
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(dataArray);

    for (let i = 0; i < numBars; i++) {
      const index = Math.floor((i / numBars) * bufferLength);
      frequencies[i] = dataArray[index] || 0;
    }
  } else if (state.isPlaying) {
    // Realistic rhythmic equalizer animation with bass pulse
    const t = performance.now() * 0.007;
    const bass = Math.sin(t * 1.5) * 0.35 + 0.65;
    for (let i = 0; i < numBars; i++) {
      const freqFactor = (numBars - i * 0.6) / numBars;
      const wave1 = Math.sin(t * 2 + i * 0.45);
      const wave2 = Math.cos(t * 3.5 - i * 0.25);
      const combined = (wave1 * 0.5 + wave2 * 0.5 + 1) * 0.5;
      frequencies[i] = Math.floor(combined * 200 * freqFactor * bass + Math.random() * 25);
    }
  } else {
    // Idle flat subtle line
    frequencies.fill(8);
  }

  for (let i = 0; i < numBars; i++) {
    const val = frequencies[i] / 255;
    const barHeight = Math.max(3, val * (height * 0.85));
    const x = i * (barWidth + gap);
    const y = (height - barHeight) / 2; // Vertically centered

    // Gradient styling (Vibrant Coral Red to Crimson)
    const gradient = canvasCtx.createLinearGradient(0, y, 0, y + barHeight);
    gradient.addColorStop(0, "#ff4d6d");
    gradient.addColorStop(1, "#ff2a4b");

    canvasCtx.fillStyle = gradient;
    canvasCtx.beginPath();
    canvasCtx.roundRect(x, y, barWidth, barHeight, 2);
    canvasCtx.fill();
  }
}

// =============================================================================
// 5. Player Core Functions
// =============================================================================

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function loadTrack(index, autoPlay = true) {
  if (index < 0 || index >= state.playlist.length) return;
  state.currentIndex = index;
  const track = state.playlist[index];

  // Update track information display
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  trackAlbum.textContent = track.album || "Single";

  miniTitle.textContent = track.title;
  miniArtist.textContent = track.artist;

  // Update Album Artwork
  albumArt.src = track.cover;
  miniArt.src = track.cover;
  stageBackdrop.style.backgroundImage = `url("${track.cover}")`;

  // Update Favorite Button State
  const isLiked = state.favorites.has(track.id);
  updateLikeBtnState(isLiked);

  // Set audio source
  audio.src = track.url;
  audio.load();

  // Reset progress indicators
  progressFill.style.width = "0%";
  progressHandle.style.left = "0%";
  currentTimeLabel.textContent = "0:00";
  durationTimeLabel.textContent = track.duration || "0:00";

  // Re-render playlist to highlight active track
  renderPlaylist();
  scrollToActiveTrack();

  // Play audio if specified
  if (autoPlay) {
    playAudio();
  } else {
    pauseAudio();
  }
}

function playAudio() {
  // Ensure AudioContext is initialized/resumed on user gesture
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  } else if (!audioContext) {
    initAudioVisualizer();
  }

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        state.isPlaying = true;
        updatePlayPauseUI(true);
      })
      .catch((error) => {
        console.warn("Playback prevented or network issue:", error);
        // Toggle UI back if auto-play was blocked
        state.isPlaying = false;
        updatePlayPauseUI(false);
      });
  }
}

function pauseAudio() {
  audio.pause();
  state.isPlaying = false;
  updatePlayPauseUI(false);
}

function togglePlayPause() {
  if (state.isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

function updatePlayPauseUI(isPlaying) {
  if (isPlaying) {
    playIcon.hidden = true;
    pauseIcon.hidden = false;
    playPauseBtn.title = "Pause (Space)";
    playPauseBtn.setAttribute("aria-label", "Pause");
    appContainer.classList.add("is-playing");
    const currentTrack = state.playlist[state.currentIndex];
    if (currentTrack) {
      document.title = `▶ ${currentTrack.title} • ${currentTrack.artist}`;
    }
  } else {
    playIcon.hidden = false;
    pauseIcon.hidden = true;
    playPauseBtn.title = "Play (Space)";
    playPauseBtn.setAttribute("aria-label", "Play");
    appContainer.classList.remove("is-playing");
    const currentTrack = state.playlist[state.currentIndex];
    if (currentTrack) {
      document.title = `${currentTrack.title} • ${currentTrack.artist} | Musify`;
    }
  }

  // Update equalizer state in playlist
  const activeRow = playlistTracksEl.querySelector(`.track-row[data-index="${state.currentIndex}"]`);
  if (activeRow) {
    if (isPlaying) {
      activeRow.classList.add("is-playing");
    } else {
      activeRow.classList.remove("is-playing");
    }
  }
}

function playNextSong() {
  if (state.playlist.length === 0) return;

  // Add current to history
  state.history.push(state.currentIndex);

  if (state.isShuffle) {
    if (state.playlist.length === 1) {
      audio.currentTime = 0;
      playAudio();
      return;
    }
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * state.playlist.length);
    } while (randomIndex === state.currentIndex && state.playlist.length > 1);

    loadTrack(randomIndex, true);
  } else {
    const nextIndex = (state.currentIndex + 1) % state.playlist.length;
    // If not repeating all and reached the end
    if (nextIndex === 0 && state.repeatMode === "off") {
      loadTrack(0, false);
      return;
    }
    loadTrack(nextIndex, true);
  }
}

function playPrevSong() {
  if (state.playlist.length === 0) return;

  // If song has played for more than 3 seconds, standard behavior is to restart current track
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    playAudio();
    return;
  }

  if (state.history.length > 0) {
    const prevIndex = state.history.pop();
    loadTrack(prevIndex, true);
    return;
  }

  const prevIndex = (state.currentIndex - 1 + state.playlist.length) % state.playlist.length;
  loadTrack(prevIndex, true);
}

// =============================================================================
// 6. Autoplay on Track End
// =============================================================================
audio.addEventListener("ended", () => {
  if (state.repeatMode === "one") {
    audio.currentTime = 0;
    playAudio();
  } else {
    // Autoplay next song seamlessly
    playNextSong();
  }
});

// Procedural audio fallback in case remote audio stream fails or network is offline
function generateProceduralSynthWav(durationSec = 25, sampleRate = 22050) {
  const numSamples = durationSec * sampleRate;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Warm chord progression: Cmaj7 - Am7 - Fmaj7 - Gsus4
  const chords = [
    [261.63, 329.63, 392.00, 493.88],
    [220.00, 261.63, 329.63, 392.00],
    [174.61, 220.00, 261.63, 329.63],
    [196.00, 261.63, 293.66, 392.00]
  ];

  let offset = 44;
  const chordDuration = 5;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor((t / chordDuration) % chords.length);
    const chord = chords[chordIndex];
    let sample = 0;
    const env = Math.sin(((t % chordDuration) / chordDuration) * Math.PI);
    for (let c = 0; c < chord.length; c++) {
      const freq = chord[c];
      sample += Math.sin(2 * Math.PI * freq * t) * (0.08 / chord.length);
    }
    // Gentle sub-bass pulse
    sample += Math.sin(2 * Math.PI * (chord[0] / 2) * t) * 0.12 * env;
    const val = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, val < 0 ? val * 0x8000 : val * 0x7FFF, true);
    offset += 2;
  }
  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

audio.addEventListener("error", (e) => {
  console.warn("Audio stream could not be loaded from remote URL, activating offline synthesized track.", e);
  const track = state.playlist[state.currentIndex];
  if (track && !track.isFallback) {
    track.isFallback = true;
    const synthUrl = generateProceduralSynthWav(30);
    audio.src = synthUrl;
    audio.load();
    if (state.isPlaying) {
      playAudio();
    }
    showToast("Network stream offline: Loaded ambient synth track", "info");
  }
});

// =============================================================================
// 7. Scrubber & Progress Bar Functionality
// =============================================================================
audio.addEventListener("timeupdate", () => {
  if (state.isSeeking) return;

  const current = audio.currentTime;
  const total = audio.duration || state.playlist[state.currentIndex]?.durationSec || 0;

  currentTimeLabel.textContent = formatTime(current);

  if (total > 0) {
    const pct = (current / total) * 100;
    progressFill.style.width = `${pct}%`;
    progressHandle.style.left = `${pct}%`;
  }
});

audio.addEventListener("loadedmetadata", () => {
  if (audio.duration && !isNaN(audio.duration)) {
    durationTimeLabel.textContent = formatTime(audio.duration);
    state.playlist[state.currentIndex].duration = formatTime(audio.duration);
    state.playlist[state.currentIndex].durationSec = Math.floor(audio.duration);
  }
});

// Buffer progress
audio.addEventListener("progress", () => {
  if (audio.buffered.length > 0 && audio.duration) {
    const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
    const bufferedPct = (bufferedEnd / audio.duration) * 100;
    progressBuffer.style.width = `${bufferedPct}%`;
  }
});

function handleSeek(e) {
  const rect = progressWrapper.getBoundingClientRect();
  const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const seekPct = clickX / rect.width;
  const targetTime = seekPct * (audio.duration || 0);

  progressFill.style.width = `${seekPct * 100}%`;
  progressHandle.style.left = `${seekPct * 100}%`;
  currentTimeLabel.textContent = formatTime(targetTime);

  return targetTime;
}

progressWrapper.addEventListener("mousedown", (e) => {
  state.isSeeking = true;
  progressWrapper.classList.add("is-dragging");
  const targetTime = handleSeek(e);

  function onMouseMove(moveEvent) {
    if (state.isSeeking) {
      handleSeek(moveEvent);
    }
  }

  function onMouseUp(upEvent) {
    if (state.isSeeking) {
      const finalTime = handleSeek(upEvent);
      if (!isNaN(finalTime) && isFinite(finalTime)) {
        audio.currentTime = finalTime;
      }
      state.isSeeking = false;
      progressWrapper.classList.remove("is-dragging");
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});

// Tooltip on Hover
progressWrapper.addEventListener("mousemove", (e) => {
  const rect = progressWrapper.getBoundingClientRect();
  const hoverX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const hoverPct = hoverX / rect.width;
  const hoverTime = hoverPct * (audio.duration || state.playlist[state.currentIndex]?.durationSec || 0);

  progressTooltip.style.left = `${hoverX}px`;
  progressTooltip.textContent = formatTime(hoverTime);
  progressTooltip.style.opacity = "1";
});

progressWrapper.addEventListener("mouseleave", () => {
  progressTooltip.style.opacity = "0";
});

// Touch support for progress bar
progressWrapper.addEventListener("touchstart", (e) => {
  state.isSeeking = true;
  const touch = e.touches[0];
  handleSeek(touch);

  function onTouchMove(ev) {
    if (state.isSeeking) {
      handleSeek(ev.touches[0]);
    }
  }

  function onTouchEnd(ev) {
    if (state.isSeeking) {
      const touchEnd = ev.changedTouches[0];
      const finalTime = handleSeek(touchEnd);
      if (!isNaN(finalTime) && isFinite(finalTime)) {
        audio.currentTime = finalTime;
      }
      state.isSeeking = false;
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    }
  }

  document.addEventListener("touchmove", onTouchMove);
  document.addEventListener("touchend", onTouchEnd);
}, { passive: true });

// =============================================================================
// 8. Volume Control
// =============================================================================

function setVolume(level) {
  level = Math.max(0, Math.min(1, level));
  state.volume = level;
  state.isMuted = (level === 0);

  audio.volume = level;
  const pct = Math.round(level * 100);
  volumeFill.style.width = `${pct}%`;
  volumeHandle.style.left = `${pct}%`;
  volumePercentage.textContent = `${pct}%`;

  // Update volume icon
  if (level === 0 || state.isMuted) {
    volHigh.hidden = true;
    volLow.hidden = true;
    volMuted.hidden = false;
  } else if (level < 0.5) {
    volHigh.hidden = true;
    volLow.hidden = false;
    volMuted.hidden = true;
  } else {
    volHigh.hidden = false;
    volLow.hidden = true;
    volMuted.hidden = true;
  }

  localStorage.setItem("musify_player_volume", level);
}

function handleVolumeSeek(e) {
  const rect = volumeWrapper.getBoundingClientRect();
  const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const newVol = clickX / rect.width;
  setVolume(newVol);
}

volumeWrapper.addEventListener("mousedown", (e) => {
  handleVolumeSeek(e);

  function onMouseMove(moveEvent) {
    handleVolumeSeek(moveEvent);
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});

volumeBtn.addEventListener("click", () => {
  if (state.isMuted || state.volume === 0) {
    const savedVol = parseFloat(localStorage.getItem("musify_player_volume_prev") || localStorage.getItem("spotify_player_volume_prev")) || 0.8;
    setVolume(savedVol);
  } else {
    localStorage.setItem("musify_player_volume_prev", state.volume);
    setVolume(0);
  }
});

// Restore saved volume
const savedVolume = localStorage.getItem("musify_player_volume") || localStorage.getItem("spotify_player_volume");
if (savedVolume !== null) {
  setVolume(parseFloat(savedVolume));
} else {
  setVolume(0.8);
}

// =============================================================================
// 9. Shuffle & Repeat Controls
// =============================================================================

shuffleBtn.addEventListener("click", () => {
  state.isShuffle = !state.isShuffle;
  shuffleBtn.classList.toggle("active", state.isShuffle);
  shuffleBtn.title = `Shuffle: ${state.isShuffle ? "On (S)" : "Off (S)"}`;
  showToast(state.isShuffle ? "Shuffle turned ON" : "Shuffle turned OFF", "info");
});

repeatBtn.addEventListener("click", () => {
  // Cycle: 'off' -> 'all' -> 'one' -> 'off'
  if (state.repeatMode === "off") {
    state.repeatMode = "all";
    repeatBtn.classList.add("active");
    repeatBtn.classList.remove("repeat-one");
    repeatBtn.title = "Repeat: All (R)";
    showToast("Repeat Playlist ON", "info");
  } else if (state.repeatMode === "all") {
    state.repeatMode = "one";
    repeatBtn.classList.add("active", "repeat-one");
    repeatBtn.title = "Repeat: Current Track (R)";
    showToast("Repeat Current Track", "info");
  } else {
    state.repeatMode = "off";
    repeatBtn.classList.remove("active", "repeat-one");
    repeatBtn.title = "Repeat: Off (R)";
    showToast("Repeat turned OFF", "info");
  }
});

// =============================================================================
// 10. Favorites / Like Management
// =============================================================================

function toggleLike(trackId) {
  const willLike = !state.favorites.has(trackId);
  if (willLike) {
    state.favorites.add(trackId);
    showToast("Added to Liked Songs");
  } else {
    state.favorites.delete(trackId);
    showToast("Removed from Liked Songs", "info");
  }

  // Persist to localStorage
  localStorage.setItem("musify_liked_tracks", JSON.stringify([...state.favorites]));

  const currentTrack = state.playlist[state.currentIndex];
  if (currentTrack && currentTrack.id === trackId) {
    updateLikeBtnState(state.favorites.has(trackId));
  }

  renderPlaylist();
}

function updateLikeBtnState(isLiked) {
  if (isLiked) {
    likeBtn.classList.add("liked");
    miniLikeBtn.classList.add("liked");
    likeBtn.title = "Remove from Your Library";
  } else {
    likeBtn.classList.remove("liked");
    miniLikeBtn.classList.remove("liked");
    likeBtn.title = "Save to Your Library";
  }
}

likeBtn.addEventListener("click", () => {
  const current = state.playlist[state.currentIndex];
  if (current) toggleLike(current.id);
});

miniLikeBtn.addEventListener("click", () => {
  const current = state.playlist[state.currentIndex];
  if (current) toggleLike(current.id);
});

// =============================================================================
// 11. Playlist Rendering & Interaction
// =============================================================================

function renderPlaylist() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  playlistTracksEl.innerHTML = "";

  const matchingTracks = [];

  state.playlist.forEach((track, index) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchTerm) ||
      track.artist.toLowerCase().includes(searchTerm) ||
      (track.album && track.album.toLowerCase().includes(searchTerm));

    if (matchesSearch) {
      matchingTracks.push({ track, index });
    }
  });

  songCountEl.textContent = `${state.playlist.length} song${state.playlist.length === 1 ? "" : "s"}`;

  if (matchingTracks.length === 0) {
    noResultsEl.hidden = false;
    return;
  }
  noResultsEl.hidden = true;

  matchingTracks.forEach(({ track, index }) => {
    const isCurrent = index === state.currentIndex;
    const isLiked = state.favorites.has(track.id);

    const li = document.createElement("li");
    li.className = `track-row ${isCurrent ? "active" : ""} ${isCurrent && state.isPlaying ? "is-playing" : ""}`;
    li.dataset.index = index;

    li.innerHTML = `
      <div class="row-index">
        <span class="row-num">${index + 1}</span>
        <svg class="row-play-hint" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="6 3 20 12 6 21 6 3"></polygon>
        </svg>
        <div class="row-equalizer">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <img class="row-art" src="${track.cover}" alt="${track.title}" loading="lazy" />
      <div class="row-details">
        <span class="row-title">${escapeHtml(track.title)}</span>
        <span class="row-artist">${escapeHtml(track.artist)}</span>
      </div>
      <button class="row-like-btn ${isLiked ? "liked" : ""}" data-track-id="${track.id}" title="${isLiked ? "Liked" : "Like"}">
        <svg class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      <span class="row-duration">${track.duration}</span>
      <button class="row-remove-btn" data-index="${index}" title="Remove track">✕</button>
    `;

    // Row click handler
    li.addEventListener("click", (e) => {
      // Don't trigger if clicked on like or remove button
      if (e.target.closest(".row-like-btn") || e.target.closest(".row-remove-btn")) return;
      if (index === state.currentIndex) {
        togglePlayPause();
      } else {
        loadTrack(index, true);
      }
    });

    // Row Like Button
    const rowLikeBtn = li.querySelector(".row-like-btn");
    rowLikeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleLike(track.id);
    });

    // Row Remove Button
    const rowRemoveBtn = li.querySelector(".row-remove-btn");
    rowRemoveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeTrack(index);
    });

    playlistTracksEl.appendChild(li);
  });
}

function removeTrack(index) {
  if (state.playlist.length <= 1) {
    alert("You need at least one track in your playlist.");
    return;
  }

  const removingCurrent = index === state.currentIndex;
  state.playlist.splice(index, 1);

  if (removingCurrent) {
    const nextIdx = index >= state.playlist.length ? 0 : index;
    loadTrack(nextIdx, state.isPlaying);
  } else if (index < state.currentIndex) {
    state.currentIndex--;
  }

  renderPlaylist();
}

function scrollToActiveTrack() {
  const activeEl = playlistTracksEl.querySelector(`.track-row[data-index="${state.currentIndex}"]`);
  if (activeEl) {
    activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Search & Filter
searchInput.addEventListener("input", () => {
  const hasText = searchInput.value.trim().length > 0;
  clearSearchBtn.hidden = !hasText;
  renderPlaylist();
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearSearchBtn.hidden = true;
  renderPlaylist();
  searchInput.focus();
});

// Shuffle Entire Playlist Order
shufflePlaylistBtn.addEventListener("click", () => {
  const currentTrack = state.playlist[state.currentIndex];

  // Fisher-Yates shuffle
  for (let i = state.playlist.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.playlist[i], state.playlist[j]] = [state.playlist[j], state.playlist[i]];
  }

  // Preserve current playing track index
  state.currentIndex = state.playlist.findIndex((t) => t.id === currentTrack.id);
  renderPlaylist();
  scrollToActiveTrack();
});

// =============================================================================
// 12. Local File Import & Drag-and-Drop
// =============================================================================

function addAudioFiles(files) {
  const audioFiles = Array.from(files).filter((file) => file.type.startsWith("audio/"));

  if (audioFiles.length === 0) {
    alert("Please select valid audio files (e.g. .mp3, .wav, .ogg, .aac).");
    return;
  }

  const placeholderCovers = [
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80"
  ];

  audioFiles.forEach((file) => {
    const objectUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    const parts = cleanName.split("-").map((p) => p.trim());

    let title = cleanName;
    let artist = "Local File";

    if (parts.length > 1) {
      artist = parts[0];
      title = parts.slice(1).join(" - ");
    }

    const randomCover = placeholderCovers[Math.floor(Math.random() * placeholderCovers.length)];

    const newTrack = {
      id: "local-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      title: title,
      artist: artist,
      album: "Local Uploads",
      duration: "0:00",
      durationSec: 0,
      cover: randomCover,
      url: objectUrl,
      liked: false
    };

    // Preload audio to discover duration
    const tempAudio = new Audio();
    tempAudio.src = objectUrl;
    tempAudio.addEventListener("loadedmetadata", () => {
      newTrack.duration = formatTime(tempAudio.duration);
      newTrack.durationSec = Math.floor(tempAudio.duration);
      renderPlaylist();
    });

    state.playlist.push(newTrack);
  });

  renderPlaylist();

  // Switch to the newly imported track and start playing!
  const newTrackIndex = state.playlist.length - audioFiles.length;
  loadTrack(newTrackIndex, true);
  showToast(`Imported ${audioFiles.length} song${audioFiles.length > 1 ? "s" : ""}`);
}

fileUpload.addEventListener("change", (e) => {
  addAudioFiles(e.target.files);
  e.target.value = "";
});

// Drag and drop support
["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add("drag-active");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove("drag-active");
  });
});

dropZone.addEventListener("drop", (e) => {
  const dt = e.dataTransfer;
  if (dt && dt.files) {
    addAudioFiles(dt.files);
  }
});

// Window level drag-and-drop
window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => {
  if (e.target.closest("#drop-zone")) return;
  e.preventDefault();
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    addAudioFiles(e.dataTransfer.files);
  }
});

// =============================================================================
// 13. Mobile Drawer & Responsive Layout
// =============================================================================
playlistToggleBtn.addEventListener("click", () => {
  const playlistSection = document.querySelector(".playlist-section");
  if (playlistSection.style.display === "none" || getComputedStyle(playlistSection).display === "none") {
    playlistSection.style.display = "flex";
  } else {
    playlistSection.style.display = "none";
  }
});

// =============================================================================
// 14. Keyboard Shortcuts
// =============================================================================
document.addEventListener("keydown", (e) => {
  // Ignore key shortcuts if focused on search input
  if (document.activeElement === searchInput) {
    if (e.key === "Escape") {
      searchInput.blur();
    }
    return;
  }

  switch (e.code) {
    case "Space":
      e.preventDefault();
      togglePlayPause();
      break;
    case "ArrowRight":
      e.preventDefault();
      audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || audio.currentTime);
      break;
    case "ArrowLeft":
      e.preventDefault();
      audio.currentTime = Math.max(audio.currentTime - 5, 0);
      break;
    case "ArrowUp":
      e.preventDefault();
      setVolume(state.volume + 0.05);
      break;
    case "ArrowDown":
      e.preventDefault();
      setVolume(state.volume - 0.05);
      break;
    case "KeyN":
      playNextSong();
      break;
    case "KeyP":
      playPrevSong();
      break;
    case "KeyM":
      volumeBtn.click();
      break;
    case "KeyS":
      shuffleBtn.click();
      break;
    case "KeyR":
      repeatBtn.click();
      break;
    case "KeyL":
      likeBtn.click();
      break;
    case "Escape":
      shortcutsModal.hidden = true;
      break;
  }
});

// Modal Dialog Controls
shortcutsBtn.addEventListener("click", () => {
  shortcutsModal.hidden = false;
});

closeModalBtn.addEventListener("click", () => {
  shortcutsModal.hidden = true;
});

shortcutsModal.addEventListener("click", (e) => {
  if (e.target === shortcutsModal) {
    shortcutsModal.hidden = true;
  }
});

// =============================================================================
// 15. Control Button Event Listeners
// =============================================================================
playPauseBtn.addEventListener("click", togglePlayPause);
nextBtn.addEventListener("click", playNextSong);
prevBtn.addEventListener("click", playPrevSong);

// Canvas resize listener
window.addEventListener("resize", () => {
  resizeVisualizerCanvas();
});

// =============================================================================
// 16. Initialize Application
// =============================================================================
window.addEventListener("DOMContentLoaded", () => {
  resizeVisualizerCanvas();
  drawVisualizer();
  // Load first track in paused state (ready to play on user click)
  loadTrack(0, false);
});
