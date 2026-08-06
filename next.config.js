/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Vendor photos are served by /api/image with their own cache headers, and
        // the app renders them through plain <img>, so Next's optimizer is not in
        // the path.
        unoptimized: true,
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
        ],
    },
};

module.exports = nextConfig;
