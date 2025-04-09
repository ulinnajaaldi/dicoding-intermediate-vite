import routes from '../constants/routes';
import { getActiveRoute } from '../utils/url-parser';

type AppConstructor = {
  navigationDrawer: HTMLElement | null;
  drawerButton: HTMLElement | null;
  content: HTMLElement | null;
};

class App {
  #content: HTMLElement | null;
  #drawerButton: HTMLElement | null;
  #navigationDrawer: HTMLElement | null;

  constructor({ navigationDrawer, drawerButton, content }: AppConstructor) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton?.addEventListener('click', () => {
      this.#navigationDrawer?.classList.toggle('translate-x-full');
      this.#navigationDrawer?.classList.add('right-0');
      this.#navigationDrawer?.classList.remove('-right-[100%]');
    });

    document.body.addEventListener('click', (e: any) => {
      if (!this.#navigationDrawer?.contains(e.target) && !this.#drawerButton?.contains(e.target)) {
        this.#navigationDrawer?.classList.add('translate-x-full', 'right-0');
      }

      this.#navigationDrawer?.querySelectorAll('a').forEach((link) => {
        if (link.contains(e.target)) {
          this.#navigationDrawer?.classList.add('translate-x-full', 'right-0');
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute() || '/';
    const page = routes[url as keyof typeof routes];

    if (this.#content) {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    }
  }
}

export default App;
