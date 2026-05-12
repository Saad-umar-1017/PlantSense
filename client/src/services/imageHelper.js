// Returns a usable image src — handles base64 data URIs and legacy /uploads/ paths
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export const getImageSrc = (imageUrl) => {
  if (!imageUrl) return null;
  // Already a data URI (base64)
  if (imageUrl.startsWith('data:')) return imageUrl;
  // Legacy file path
  return `${API_BASE}${imageUrl}`;
};
