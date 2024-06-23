/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true
    },
    images: {
        domains: ['wsgqbfgqopgbxkhorawds.supabase.co'],
      },
};

module.exports = nextConfig;
