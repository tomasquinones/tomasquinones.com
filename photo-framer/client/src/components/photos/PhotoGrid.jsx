import PhotoCard from './PhotoCard';
import './PhotoGrid.css';

function PhotoGrid({ photos, onPhotoClick, onPhotoDeleted, canDelete }) {
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <div className="photo-grid">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onClick={() => onPhotoClick(index)}
          onDelete={canDelete ? () => onPhotoDeleted(photo.id) : null}
        />
      ))}
    </div>
  );
}

export default PhotoGrid;
