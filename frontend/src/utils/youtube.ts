/**
 * YouTube Utility Functions
 * Extracts video ID and generates clean embed and thumbnail URLs.
 */

export function getYouTubeVideoId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Handle direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regular expressions covering standard watch, short urls, embeds, and shorts
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/,
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const id = match[1] && match[1].length === 11 ? match[1] : (match[7] && match[7].length === 11 ? match[7] : null);
      if (id) return id;
    }
  }

  return null;
}

export function getYouTubeEmbedUrl(url?: string | null): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;
}

export function getYouTubeThumbnail(url?: string | null, quality: 'default' | 'hq' | 'maxres' = 'hq'): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  const qualityMap = {
    default: 'default.jpg',
    hq: 'hqdefault.jpg',
    maxres: 'maxresdefault.jpg',
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality] || 'hqdefault.jpg'}`;
}
