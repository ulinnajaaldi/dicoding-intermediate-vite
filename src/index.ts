import 'toastify-js/src/toastify.css';
import 'leaflet/dist/leaflet.css';

import './style.css';

import App from './pages/app';
import Camera from './utils/camera';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
    drawerButton: document.querySelector('#drawer-button'),
    skipContent: document.querySelector('#skip-link'),
  });
  app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();

    Camera.stopAllStreams();
  });
});
