'use client';

import { useRef } from 'react';

export default function FileUploadField({
  label,
  hint,
  accept,
  uploading,
  fileName,
  previewUrl,
  onFileSelect,
  icon = 'fa-cloud-upload-alt',
  showCamera = false,
}) {
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const isImagePreview =
    previewUrl &&
    (/^data:image\//.test(previewUrl) ||
      /^\/api\/image\/[a-f0-9]{64}$/i.test(previewUrl) ||
      /\.(jpg|jpeg|png|webp|gif|heic)(\?|$)/i.test(previewUrl) ||
      (/cloudinary\.com/i.test(previewUrl) && !/\.(pdf|doc|docx)(\?|$)/i.test(previewUrl)));

  const triggerSelect = (e) => {
    if (uploading) return;
    e?.stopPropagation?.();
    fileRef.current?.click();
  };

  const triggerCamera = (e) => {
    if (uploading) return;
    e.stopPropagation();
    cameraRef.current?.click();
  };

  return (
    <div className="file-upload-field">
      <label>{label}</label>
      {hint && <span className="file-upload-hint">{hint}</span>}
      <div className="file-upload-card" onClick={triggerSelect}>
        {isImagePreview ? (
          <img src={previewUrl} alt="" className="file-upload-preview" />
        ) : fileName ? (
          <div className="file-upload-file-info">
            <i className={`fas ${/\.pdf$/i.test(fileName) ? 'fa-file-pdf' : 'fa-file-alt'}`}></i>
            <span>{fileName}</span>
          </div>
        ) : (
          <div className="file-upload-empty">
            <i className={`fas ${icon}`}></i>
            <span>לחצו למטה לצילום או בחירת קובץ</span>
          </div>
        )}
        {uploading && <div className="upload-overlay">מעלה...</div>}
      </div>
      <div className="file-upload-mobile-actions">
        {showCamera && (
          <button
            type="button"
            className="file-upload-mobile-btn"
            onClick={triggerCamera}
            disabled={uploading}
          >
            <i className="fas fa-camera"></i> צלם מהטלפון
          </button>
        )}
        <button
          type="button"
          className="file-upload-mobile-btn secondary"
          onClick={triggerSelect}
          disabled={uploading}
        >
          <i className="fas fa-folder-open"></i> בחר קובץ
        </button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        onChange={onFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
}
