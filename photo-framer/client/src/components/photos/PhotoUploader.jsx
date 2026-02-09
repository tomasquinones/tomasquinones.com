import { useState, useRef } from 'react';
import { photoService } from '../../services/photos';
import './PhotoUploader.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 20;

function PhotoUploader({ albumId, onSuccess, onCancel }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFiles = (fileList) => {
    const validFiles = [];
    const errors = [];

    for (const file of fileList) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Allowed: JPEG, PNG, WebP, TIFF`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large. Maximum size: 50MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > MAX_FILES) {
      errors.push(`Too many files. Maximum: ${MAX_FILES} files per upload`);
      validFiles.splice(MAX_FILES);
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    return validFiles;
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = validateFiles(selectedFiles);
    setFiles(validFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);
    setFiles(validFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const uploadedPhotos = await photoService.uploadPhotos(
        albumId,
        files,
        (percent) => setProgress(percent)
      );
      onSuccess(uploadedPhotos);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="photo-uploader">
      <h3>Upload Photos</h3>

      <div className="protection-notice">
        <strong>Tip:</strong> For AI-scraping protection, consider processing your images with{' '}
        <a href="https://glaze.cs.uchicago.edu/" target="_blank" rel="noopener noreferrer">
          Glaze
        </a>{' '}
        or{' '}
        <a href="https://nightshade.cs.uchicago.edu/" target="_blank" rel="noopener noreferrer">
          Nightshade
        </a>{' '}
        before uploading.
      </div>

      {error && <div className="upload-error">{error}</div>}

      <div
        className="dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <p className="dropzone-text">
          Drag & drop photos here, or click to select
        </p>
        <p className="dropzone-hint">
          JPEG, PNG, WebP, TIFF - Max 50MB each, up to 20 files
        </p>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h4>{files.length} file(s) selected</h4>
          <ul>
            {files.map((file, index) => (
              <li key={index} className="file-item">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  className="remove-file"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">{progress}% uploaded</p>
        </div>
      )}

      <div className="uploader-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={uploading}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} Photo(s)`}
        </button>
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default PhotoUploader;
