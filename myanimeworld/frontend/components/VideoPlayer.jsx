import { useEffect, useRef, useState } from 'react';

/**
 * Custom HTML5 video player with HLS support via hls.js
 * Features: play/pause, volume, fullscreen, quality selection, subtitles, progress tracking
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
  const [subtitle, setSubtitle] = useState('');
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef(null);

  const streamUrl = episode?.qualities?.[quality] || episode?.streamUrl;

  // Initialize HLS
  useEffect(() => {
    if (!videoRef.current || !streamUrl) return;

    const initPlayer = async () => {
      // Dynamically import hls.js (client-side only)
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
        // Safari native HLS
        videoRef.current.src = streamUrl;
        videoRef.current.play().catch(() => {});
        setPlaying(true);
      }
    };

    initPlayer();
    return () => { if (hlsRef.current) hlsRef.current.destroy(); };
  }, [streamUrl]);

  // Quality change — reload HLS with new URL
  useEffect(() => {
    if (hlsRef.current && videoRef.current) {
      const time = videoRef.current.currentTime;
      hlsRef.current.loadSource(episode.qualities[quality] || episode.streamUrl);
      videoRef.current.currentTime = time;
      if (playing) videoRef.current.play().catch(() => {});
    }
  }, [quality]);

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
    if (!document.fullscreenElement) container?.requestFullscreen();
    else document.exitFullscreen();
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
        {/* Subtitle tracks */}
        {episode?.subtitles?.map((sub) => (
          <track
            key={sub.lang}
            kind="subtitles"
            src={sub.url}
            srcLang={sub.lang}
            label={sub.label}
            default={sub.lang === subtitle}
          />
        ))}
      </video>

      {/* Controls overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 accent-brand cursor-pointer mb-3"
        />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-brand transition text-lg">
              {playing ? '⏸' : '▶'}
            </button>

            {/* Volume */}
            <button onClick={toggleMute} className="text-white text-sm">{muted ? '🔇' : '🔊'}</button>
            <input
              type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 accent-brand cursor-pointer"
            />

            {/* Time */}
            <span className="text-white text-xs">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Subtitle selector */}
            {episode?.subtitles?.length > 0 && (
              <select
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="bg-black/60 text-white text-xs border border-gray-600 rounded px-2 py-1"
              >
                <option value="">No Subtitles</option>
                {episode.subtitles.map((s) => (
                  <option key={s.lang} value={s.lang}>{s.label}</option>
                ))}
              </select>
            )}

            {/* Quality selector */}
            {episode?.qualities && (
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="bg-black/60 text-white text-xs border border-gray-600 rounded px-2 py-1"
              >
                {Object.keys(episode.qualities).map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            )}

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white hover:text-brand transition text-sm">⛶</button>
          </div>
        </div>
      </div>

      {/* Click to play/pause */}
      <div className="absolute inset-0 cursor-pointer" onClick={togglePlay} />
    </div>
  );
}
