import withBundleAnalyzer from '@next/bundle-analyzer';
import { combineLocales, combineMenus } from './src/utils/dynamicsMerged.mjs';

let hasCombinedLocalesAndMenus = false;

const withCombineLocalesAndMenus = (nextConfig = {}) => {
  return {
    ...nextConfig,
    webpack(config, { isServer, dev }) {
      if (!dev && isServer && !hasCombinedLocalesAndMenus) {
        config.plugins.push({
          apply: (compiler) => {
            compiler.hooks.beforeCompile.tapPromise('CombineLocalesAndMenusPlugin', async (compilation) => {
              if (!hasCombinedLocalesAndMenus) {
                await combineLocales();
                await combineMenus();
                hasCombinedLocalesAndMenus = true;
              }
            });
          },
        });
      }

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, { isServer, dev });
      }

      return config;
    },
  };
};

const nextConfig = withCombineLocalesAndMenus(
  withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  })({
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
  })
);

export default nextConfig;
