import { useEffect, useRef, useState } from 'react';

/**
 * Video player yang support dua mode:
 * 1. YouTube embed (youtubeId)
 * 2. HLS stream (streamUrl)
 */
export default function VideoPlayer({ episode, onEnded, onProgress }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQuality] = useState('720p');
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef(null);

  const isYoutube = !!episode?.youtubeId;
  const streamUrl = episode?.qualities?.[quality] || episode?.streamUrl;

  // Init HLS player (only for non-YouTube)
  useEffect(() => {
    if (isYoutube || !videoRef.current || !streamUrl) return;

    const initPlayer = async () => {
      const Hls = (await import('hls.js')).default;
      if (Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play().catch(() => {});
          setPlaying(true);
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = streamUrl;
        videoRef.current.play().catch(() => {});
        setPlaying(true);
      }
    };

    initPlayer();
    return () => { if (hlsRef.current) hlsRef.current.destroy(); };
  }, [streamUrl, isYoutube]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    setMuted(v === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !muted;
    setMuted(newMuted);
    videoRef.current.muted = newMuted;
  };

  const handleSeek = (e) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement?.parentElement;
    if (!document.fullscreenElement) {
      container?.requestFullscreen();
      // Request landscape on mobile
      if (screen.orientation?.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } else {
      document.exitFullscreen();
      if (screen.orientation?.unlock) {
        screen.orientation.unlock();
      }
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  // ── YouTube mode ─────────────────────────────────────────────────────────────
  if (isYoutube) {
    const handleYTFullscreen = () => {
      const container = document.getElementById('yt-container');
      if (!document.fullscreenElement) {
        container?.requestFullscreen();
        if (screen.orientation?.lock) {
          screen.orientation.lock('landscape').catch(() => {});
        }
      } else {
        document.exitFullscreen();
        if (screen.orientation?.unlock) screen.orientation.unlock();
      }
    };

    return (
      <div id="yt-container" className="relative bg-black rounded-lg overflow-hidden w-full aspect-video group">
        <iframe
          src={`https://www.youtube.com/embed/${episode.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          title={episode.title}
        />
        {/* Fullscreen button overlay for mobile */}
        <button
          onClick={handleYTFullscreen}
          className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 md:hidden transition"
        >
          ⛶ Layar Penuh
        </button>
      </div>
    );
  }

  // ── HLS mode ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full aspect-video"
        onTimeUpdate={(e) => {
          setCurrentTime(e.target.currentTime);
          onProgress?.(e.target.currentTime);
        }}
        onDurationChange={(e) => setDuration(e.target.duration)}
        onEnded={onEnded}
        crossOrigin="anonymous"
      >
        {episode?.subtitles?.map((sub) => (
          <track key={sub.lang} kind="subtitles" src={sub.url} srcLang={sub.lang} label={sub.label} />
        ))}
      </video>

      {/* Controls overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <input type="range" min={0} max={duration || 0} value={currentTime}
          onChange={handleSeek} className="w-full h-1 accent-brand cursor-pointer mb-3" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-brand transition text-lg">
              {playing ? '⏸' : '▶'}
            </button>
            <button onClick={toggleMute} className="text-white text-sm">{muted ? '🔇' : '🔊'}</button>
            <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
              onChange={handleVolumeChange} className="w-20 h-1 accent-brand cursor-pointer" />
            <span className="text-white text-xs">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <div className="flex items-center gap-3">
            {episode?.qualities && (
              <select value={quality} onChange={(e) => setQuality(e.target.value)}
                className="bg-black/60 text-white text-xs border border-gray-600 rounded px-2 py-1">
                {Object.keys(episode.qualities).map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            )}
            <button onClick={toggleFullscreen} className="text-white hover:text-brand transition text-sm">⛶</button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 cursor-pointer" onClick={togglePlay} />
    </div>
  );
}
