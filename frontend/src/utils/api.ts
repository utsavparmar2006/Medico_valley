/**
 * Resolves the backend URL dynamically.
 * If the application is accessed over a local network (e.g. http://172.20.10.4:3000),
 * the browser client must fetch from http://172.20.10.4:5001 instead of localhost:5001.
 */
export function getBackendUrl(url: string): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('::')) {
      // In production/staging behind Nginx (Port 80), convert http://localhost:5001/api/... to /api/...
      return url
        .replace(/^http:\/\/(localhost|127\.0\.0\.1):5001\/api\//, '/api/')
        .replace(/http:\/\/(localhost|127\.0\.0\.1):5001/g, '');
    }
  }
  return url;
}
