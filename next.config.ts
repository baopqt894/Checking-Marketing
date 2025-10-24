// next.config.js
// Added remote image patterns for external app icons
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com', pathname: '**' },
      { protocol: 'https', hostname: 'play-lh.googleusercontent.com', pathname: '**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '**' },
      { protocol: 'https', hostname: 'is*.mzstatic.com', pathname: '**' }, // Apple app icons
      { protocol: 'https', hostname: 'cdn*.*', pathname: '**' }, // generic cdn wildcard (optional)
      { protocol: 'https', hostname: 'scontent.fdad1-3.fna.fbcdn.net', pathname: '**' }, // Facebook CDN
      { protocol: 'https', hostname: 'genk.mediacdn.vn', pathname: '**' }, // MediaCDN (genk)
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // fallback: you can enable this if many random domains
    // unoptimized: true,
  },
};

module.exports = nextConfig;
