/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true
    },
    images: {
        domains: ['wsgqbfgqopgbxkhorawd.supabase.co'],
    },
};

module.exports = nextConfig;
