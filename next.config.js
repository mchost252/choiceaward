module.exports = {
  reactStrictMode: true,
  trailingSlash: false,
  // Public assets and HTML files
  assetPrefix: '/',
  // Add this to solve 404 issues
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
      {
        source: '/index.html',
        destination: '/index.html',
      },
      {
        source: '/ms.html',
        destination: '/ms.html',
      },
      {
        source: '/ig.html',
        destination: '/ig.html',
      },
      {
        source: '/admin',
        destination: '/admin',
      },
    ];
  },
  // Environment variables accessible to the client
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
} 