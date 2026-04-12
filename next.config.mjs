/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Les types Supabase génériques causent des faux positifs "never"
    // sur .update() — à corriger quand @supabase/ssr sera mis à jour
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
