import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getEpisode, trackProgress } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import VideoPlayer from '../../components/VideoPlayer';

export default function Watch() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [episode, setEpisode] = useState(null);
  const [error, setError] = useState('');
  const [isLandscape, setIsLandscape] = useState(false);

  const toggleLandscape = () => {
    if (!isLandscape) {
      if (screen.orientation?.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } else {
      if (screen.orientation?.unlock) screen.orientation.unlock();
    }
    setIsLandscape(!isLandscape);
  };

  useEffect(() => {
    if (!id) return;
    getEpisode(id)
      .then((r) => setEpisode(r.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load episode'));
  }, [id]);

  const [nextEpId, setNextEpId] = useState(null);

  const handleProgress = (time) => {
    // Track every 30 seconds
    if (Math.floor(time) % 30 === 0 && user) {
      trackProgress(id).catch(() => {});
    }
  };

  const handleEnded = () => {
    if (nextEpId) router.push(`/watch/${nextEpId}`);
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        {error.includes('Premium') && (
          <Link href="/subscription" className="bg-brand text-white px-6 py-2.5 rounded-full">
            Upgrade to Premium
          </Link>
        )}
      </div>
    );
  }

  if (!episode) return <div className="flex justify-center items-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Player */}
      <div className="relative">
        <VideoPlayer episode={episode} onProgress={handleProgress} onEnded={handleEnded} />
        {/* Rotate button for mobile */}
        <button
          onClick={toggleLandscape}
          className="md:hidden absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg z-20 flex items-center gap-1"
        >
          🔄 Putar Layar
        </button>
      </div>

      {/* Episode info */}
      <div className="mt-5">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <span>Episode {episode.number}</span>
          <span>·</span>
          <span>{Math.floor(episode.duration / 60)} min</span>
          <span>·</span>
          <span>{episode.views?.toLocaleString()} views</span>
        </div>
        <h1 className="text-2xl font-bold text-white">{episode.title}</h1>
        <p className="text-gray-400 text-sm mt-2">{episode.description}</p>
      </div>

      {/* Subtitles info */}
      {episode.subtitles?.length > 0 && (
        <div className="mt-4 flex gap-2">
          <span className="text-gray-500 text-xs">Subtitles:</span>
          {episode.subtitles.map((s) => (
            <span key={s.lang} className="text-xs bg-dark-card border border-gray-700 px-2 py-0.5 rounded text-gray-300">
              {s.label}
            </span>
          ))}
        </div>
      )}

      {/* Back to anime */}
      <div className="mt-6">
        <Link href={`/anime/${episode.animeId}`}
          className="text-brand hover:underline text-sm">
          ← Back to anime page
        </Link>
      </div>
    </div>
  );
}
