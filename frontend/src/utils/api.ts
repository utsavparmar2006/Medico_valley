/**
 * Resolves the backend URL dynamically.
 * If the application is accessed over a local network (e.g. http://172.20.10.4:3000),
 * the browser client must fetch from http://172.20.10.4:5000 instead of localhost:5000.
 */
export function getBackendUrl(url: string): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If the browser is accessing the frontend via a local network IP address,
    // point the backend request to the same IP on port 5000.
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('::')) {
      return url
        .replace(/localhost:5000/g, `${hostname}:5000`)
        .replace(/127.0.0.1:5000/g, `${hostname}:5000`);
    }
  }
  return url;
}
