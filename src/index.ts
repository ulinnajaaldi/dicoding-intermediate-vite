import './style.css';

import App from './pages/app';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
    drawerButton: document.querySelector('#drawer-button'),
  });
  app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
