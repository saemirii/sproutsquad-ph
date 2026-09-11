import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Must match the bundle ID registered in App Store Connect once that's created.
  appId: 'com.mondenissin.sproutsquad',
  appName: 'SproutSquad',
  webDir: 'dist',
  // Matches the app's cream background so any native-side gap (before web
  // content paints, or around the WebView edges) shows this instead of a
  // flash of white/gray.
  backgroundColor: '#FFF9E6',
  ios: {
    // 'never': the app owns all safe-area insetting itself via
    // env(safe-area-inset-*) in CSS (IosStatusBar's top padding, IosTabBar's
    // bottom padding). 'automatic' double-inset the top (native inset MINUS
    // our own CSS padding stacked on top of it) and left the bottom inset
    // uncovered by our cream background, showing blank native space at
    // both edges.
    contentInset: 'never',
  },
};

export default config;
