import { dirname } from 'path';
import { fileURLToPath } from 'url';

/** @type {import('next').NextConfig} */
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';
const projectRoot = dirname(fileURLToPath(import.meta.url));

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
  output: 'standalone',
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: imageRemotePatterns(),
    minimumCacheTTL: 0,
    // Local dev backend runs on 127.0.0.1 (a private IP); Next 16 blocks that by
    // default as SSRF protection. Safe here since the URLs come from our own API
    // response, not user input, and remotePatterns already restricts allowed hosts.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
