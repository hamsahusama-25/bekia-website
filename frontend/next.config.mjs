// The browser always calls /api/* on the same origin; Next forwards it to the Express backend.
// BACKEND_URL is read at build time (docker-compose passes it as a build arg).
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
