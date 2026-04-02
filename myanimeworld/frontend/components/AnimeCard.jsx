import Link from 'next/link';

export default function AnimeCard({ anime }) {
  return (
    <Link href={`/anime/${anime.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-dark-card border border-gray-800 hover:border-brand transition-all duration-200">
        {/* Cover image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={anime.coverImage}
            alt={anime.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
            <span className="text-xs text-gray-300 line-clamp-3">{anime.description}</span>
          </div>
          {/* Status badge */}
          <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${
            anime.status === 'ongoing' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200'
          }`}>
            {anime.status}
          </span>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-white text-sm font-semibold line-clamp-1 group-hover:text-brand transition">
            {anime.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-gray-400 text-xs">{anime.year}</span>
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <span>★</span>
              <span>{anime.rating}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {anime.genres.slice(0, 2).map((g) => (
              <span key={g} className="text-xs bg-dark-surface text-gray-400 px-2 py-0.5 rounded-full">{g}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
