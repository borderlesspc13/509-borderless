import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@base-ui/react",
      "@supabase/supabase-js",
      "@supabase/ssr",
    ],
  },
  async rewrites() {
    return [
      { source: "/prontuario", destination: "/dashboard/pacientes" },
      { source: "/prontuario/:path*", destination: "/dashboard/pacientes/:path*" },
      { source: "/evolucao", destination: "/dashboard/evolucao" },
      { source: "/configuracoes", destination: "/dashboard/configuracoes" },
    ];
  },
};

export default nextConfig;
