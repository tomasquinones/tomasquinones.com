import { Link } from 'react-router-dom';
import './AlbumCard.css';

function AlbumCard({ album }) {
  const coverImage = album.cover_photo?.thumbnail_path || '/placeholder-album.jpg';
  const photoCount = album.photo_count || album.photos?.length || 0;

  return (
    <Link to={`/albums/${album.slug}`} className="album-card content-card">
      <div className="album-cover">
        {album.cover_photo ? (
          <img
            src={`/api/photos/thumb/${album.cover_photo.filename}`}
            alt={album.name}
            loading="lazy"
          />
        ) : (
          <div className="album-placeholder">
            <span>No Cover</span>
          </div>
        )}
        {album.visibility !== 'public' && (
          <span className="album-visibility">{album.visibility}</span>
        )}
      </div>
      <div className="album-info">
        <h3 className="album-name">{album.name}</h3>
        <p className="album-count">{photoCount} photos</p>
      </div>
    </Link>
  );
}

export default AlbumCard;
