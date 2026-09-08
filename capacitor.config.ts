import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Must match the bundle ID registered in App Store Connect once that's created.
  appId: 'com.mondenissin.sproutsquad',
  appName: 'SproutSquad',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
