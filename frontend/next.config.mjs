/** @type {import('next').NextConfig} */
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

function imageRemotePatterns() {
  const patterns = [
    {
      protocol: 'http',
      hostname: '127.0.0.1',
      port: '8000',
    },
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '8000',
    },
  ];

  try {
    const apiUrl = new URL(apiBaseUrl);
    const protocol = apiUrl.protocol.replace(':', '');

    if (protocol === 'http' || protocol === 'https') {
      patterns.push({
        protocol,
        hostname: apiUrl.hostname,
        ...(apiUrl.port ? { port: apiUrl.port } : {}),
      });
    }
  } catch {
    // Ignore invalid API URL during local config load.
  }

  return patterns;
}

const nextConfig = {
  images: {
    remotePatterns: imageRemotePatterns(),
    minimumCacheTTL: 0,
  },
};

export default nextConfig;
