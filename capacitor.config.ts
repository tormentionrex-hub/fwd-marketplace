import type { CapacitorConfig } from '@capacitor/cli';

const isProd = process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
  appId: 'com.fwdmarketplace.app',
  appName: 'FWD Marketplace',
  webDir: 'out',
  server: isProd
    ? {
        url: 'https://fwd-marketplace.vercel.app',
        cleartext: true,
      }
    : {
        url: 'http://192.168.1.220:3000',
        cleartext: true,
        allowNavigation: [
          'accounts.google.com',
          '*.google.com',
          'github.com',
          '*.github.com',
          '192.168.1.220:3000',
        ],
      },
};

export default config;
