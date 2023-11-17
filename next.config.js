const path = require('path')

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

    sassOptions: {   
        includePaths: [
            path.join(__dirname, 'node_modules'),
            '/home/hamish/dev/blog-next/node_modules/scss-utils/src'
        ],
    },
}

module.exports = nextConfig
