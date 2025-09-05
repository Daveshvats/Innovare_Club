/**
 * URL utility functions for detecting different types of content
 */

/**
 * Checks if a URL is a valid Spline scene URL
 */
export function isSplineUrl(url: string): boolean {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('spline.design') || 
    lowerUrl.includes('.splinecode') ||
    lowerUrl.includes('spline.app')
  );
}

/**
 * Checks if a URL is a regular image URL
 */
export function isImageUrl(url: string): boolean {
  if (!url) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  const lowerUrl = url.toLowerCase();
  
  return (
    imageExtensions.some(ext => lowerUrl.includes(ext)) || 
    lowerUrl.includes('unsplash.com') || 
    lowerUrl.includes('images.') ||
    lowerUrl.includes('imgur.com') ||
    lowerUrl.includes('cloudinary.com') ||
    lowerUrl.includes('pexels.com') ||
    lowerUrl.includes('pixabay.com')
  );
}

/**
 * Checks if a URL is a video URL
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv'];
  const lowerUrl = url.toLowerCase();
  
  return (
    videoExtensions.some(ext => lowerUrl.includes(ext)) ||
    lowerUrl.includes('youtube.com') ||
    lowerUrl.includes('youtu.be') ||
    lowerUrl.includes('vimeo.com')
  );
}

/**
 * Determines the content type of a URL
 */
export function getContentType(url: string): 'spline' | 'image' | 'video' | 'unknown' {
  if (isSplineUrl(url)) return 'spline';
  if (isImageUrl(url)) return 'image';
  if (isVideoUrl(url)) return 'video';
  return 'unknown';
}
