import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {isNativeApp} from './utils/platform';
import './index.css';

// Flags the document root so index.css can scope its native-only rubber-band
// scroll fix (html.native-app) — set before React mounts so there's no flash
// of the wrong layout on native.
if (isNativeApp) {
  document.documentElement.classList.add('native-app');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
