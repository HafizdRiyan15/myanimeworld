import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAnimeById, getReviews, postReview, addToWatchlist, addFavorite, getSimilar } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import AnimeCard from '../../components/AnimeCard';
import StarRating from '../../components/StarRating';

export default function AnimeDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useAuth();

  const [anime, setAnime] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [activeTab, setActiveTab] = useState('episodes');

  useEffect(() => {
    if (!slug) return;
    getAnimeById(slug).then((r) => {
      setAnime(r.data);
      getReviews(r.data.id).then((rv) => setReviews(rv.data));
      getSimilar(r.data.id).then((s) => setSimilar(s.data));
    });
  }, [slug]);

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      const res = await postReview({ animeId: anime.id, rating, comment });
      setReviews((prev) => [res.data, ...prev]);
      setReviewMsg('Review submitted!');
      setRating(0); setComment('');
    } catch (err) {
      setReviewMsg(err.response?.data?.error || 'Error submitting review');
    }
  };

  if (!anime) return <div className="flex justify-center items-center h-64 text-gray-400">Loading...</div>;

  return (
    <div>
      {/* Banner */}
      <div className="relative h-72 md:h-96"
        style={{ backgroundImage: `url(${anime.bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <div className="flex-shrink-0">
            <img src={anime.coverImage} alt={anime.title}
              className="w-48 rounded-xl shadow-2xl border-2 border-dark-card" />
          </div>

          {/* Info */}
          <div className="flex-1 pt-32 md:pt-0 md:self-end pb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {anime.genres.map((g) => (
                <Link key={g} href={`/browse?genre=${g}`}
                  className="text-xs bg-brand/20 text-brand border border-brand/30 px-3 py-1 rounded-full hover:bg-brand/30 transition">
                  {g}
                </Link>
              ))}
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">{anime.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
              <span>★ {anime.rating} ({anime.totalRatings} ratings)</span>
              <span>{anime.year}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${anime.status === 'ongoing' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300'}`}>
                {anime.status}
              </span>
            </div>
            <p className="text-gray-300 text-sm max-w-2xl mb-5">{anime.description}</p>

            <div className="flex flex-wrap gap-3">
              {anime.episodeList?.[0] && (
                <Link href={`/watch/${anime.episodeList[0].id}`}
                  className="bg-brand hover:bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium transition">
                  ▶ Watch Now
                </Link>
              )}
              {user && (
                <>
                  <button onClick={() => addToWatchlist(anime.id)}
                    className="border border-gray-600 hover:border-brand text-gray-300 hover:text-white px-5 py-2.5 rounded-full text-sm transition">
                    + Watchlist
                  </button>
                  <button onClick={() => addFavorite(anime.id)}
                    className="border border-gray-600 hover:border-yellow-400 text-gray-300 hover:text-yellow-400 px-5 py-2.5 rounded-full text-sm transition">
                    ♥ Favorite
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-800 mt-10 mb-6">
          {['episodes', 'reviews', 'trailer'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition border-b-2 -mb-px ${
                activeTab === tab ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-white'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Episodes */}
        {activeTab === 'episodes' && (
          <div className="grid gap-3 mb-10">
            {anime.episodeList?.map((ep) => (
              <Link key={ep.id} href={`/watch/${ep.id}`}
                className="flex items-center gap-4 bg-dark-card hover:bg-dark-surface border border-gray-800 hover:border-brand rounded-xl p-4 transition group">
                <img src={ep.thumbnail} alt={ep.title} className="w-32 h-18 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">EP {ep.number}</span>
                    {!ep.isFree && <span className="text-xs bg-brand/20 text-brand px-2 py-0.5 rounded-full">Premium</span>}
                  </div>
                  <h3 className="text-white font-medium group-hover:text-brand transition">{ep.title}</h3>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-1">{ep.description}</p>
                </div>
                <span className="text-gray-500 text-xs flex-shrink-0">{Math.floor(ep.duration / 60)}m</span>
              </Link>
            ))}
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div className="mb-10 space-y-6">
            {user && (
              <form onSubmit={handleReview} className="bg-dark-card border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-medium mb-3">Write a Review</h3>
                <StarRating value={rating} onChange={setRating} />
                <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full mt-3 bg-dark border border-gray-700 text-white text-sm rounded-lg p-3 focus:outline-none focus:border-brand resize-none h-24" />
                {reviewMsg && <p className="text-sm text-brand mt-2">{reviewMsg}</p>}
                <button type="submit" disabled={!rating}
                  className="mt-3 bg-brand hover:bg-brand-dark text-white px-5 py-2 rounded-full text-sm transition disabled:opacity-40">
                  Submit Review
                </button>
              </form>
            )}
            {reviews.map((r) => (
              <div key={r.id} className="bg-dark-card border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <StarRating value={r.rating} readonly />
                  <span className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-300 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Trailer */}
        {activeTab === 'trailer' && anime.trailer && (
          <div className="mb-10">
            <div className="aspect-video max-w-3xl rounded-xl overflow-hidden">
              <iframe src={anime.trailer} className="w-full h-full" allowFullScreen title="Trailer" />
            </div>
          </div>
        )}

        {/* Similar Anime */}
        {similar.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-5">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similar.map((a) => <AnimeCard key={a.id} anime={a} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
