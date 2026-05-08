import { useState, useRef } from 'react';
import { Upload, Camera, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUpload({ onImageSelect, loading = false }) {
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }
    setPreview(URL.createObjectURL(file));
    onImageSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-leaf-200 bg-leaf-50">
        <img src={preview} alt="Selected plant" className="w-full h-64 object-cover" />
        {!loading && (
          <button
            onClick={clearImage}
            className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-sm font-medium">Analyzing...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
        dragOver ? 'border-leaf-500 bg-leaf-50' : 'border-gray-200 bg-gray-50/50'
      }`}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFile(e.target.files[0])}
        className="hidden"
        id="file-upload"
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFile(e.target.files[0])}
        className="hidden"
        id="camera-upload"
      />

      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-leaf-100 rounded-2xl flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-leaf-600" />
        </div>
        <div>
          <p className="text-base font-medium text-gray-700">Upload a plant photo</p>
          <p className="text-sm text-gray-400 mt-1">JPEG, PNG, or WebP up to 10MB</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-secondary flex items-center gap-2 text-sm !py-2.5 !px-4"
          >
            <Upload className="w-4 h-4" />
            Gallery
          </button>
          <button
            onClick={() => cameraRef.current?.click()}
            className="btn-primary flex items-center gap-2 text-sm !py-2.5 !px-4"
          >
            <Camera className="w-4 h-4" />
            Camera
          </button>
        </div>
      </div>
    </div>
  );
}
