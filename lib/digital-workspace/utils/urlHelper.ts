/**
 * URL Utilities for AetherDeck
 */

/**
 * Extracts a YouTube Video ID from any standard YouTube URL.
 */
export const getYoutubeId = (url: string): string | null => {
  if (!url) return null;

  // If it's already an 11-character bare video ID, return it directly
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();

  // Standard video URL: youtube.com/watch?v=VIDEO_ID
  // Mobile/shortened video URL: youtu.be/VIDEO_ID
  // Embed URL: youtube.com/embed/VIDEO_ID
  // Shorts URL: youtube.com/shorts/VIDEO_ID

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Validates if a URL is a valid web URL.
 */
export const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/**
 * Attempts to extract a hostname for clean UI representation.
 */
export const getDomainName = (urlString: string): string => {
  try {
    const url = new URL(urlString);
    return url.hostname.replace('www.', '');
  } catch (_) {
    return urlString;
  }
};

/**
 * Formats seconds into MM:SS or HH:MM:SS format.
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const pad = (num: number) => String(num).padStart(2, '0');
  
  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
};

/**
 * Detects if a URL is a Google Image Search result link and extracts the actual direct imgurl.
 * Otherwise, returns the original URL string.
 */
export const resolveImageUrl = (url: string): string => {
  if (!url) return url;
  
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('google.') && parsedUrl.pathname.includes('/imgres')) {
      const imgUrlParam = parsedUrl.searchParams.get('imgurl');
      if (imgUrlParam) {
        return decodeURIComponent(imgUrlParam);
      }
    }
  } catch (_) {
    // Return original url if parsing fails
  }
  
  return url;
};
