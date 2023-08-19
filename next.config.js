/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export', // Export as static HTML
    images: {
        domains: [
            'images.pexels.com',
            'rails.hamishweir.uk'
        ],
        unoptimized: true, // Required for static export
    },

    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        });

        return config;
    },
}

module.exports = nextConfig
