const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    implementation: 'sass-embedded',
  },
  staticPageGenerationTimeout: 300,
  experimental: {
    proxyTimeout: 300_000, // 将超时设置为300秒
  },
  async rewrites() {
    return [
      {
        source: '/reqApi/:path*',
        destination: `${process.env.NEXTAPI_URL}/:path*/`, // 代理到后台服务器
      },
    ];
  },
};

export default nextConfig;