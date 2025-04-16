import {
  generateNavigationAuthenticated,
  generateNavigationUnauthenticated,
} from '../components/templates';
import routes from '../constants/routes';
import { transitionHelper } from '../utils';
import { getAccessToken, getLogout } from '../utils/auth';
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

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navigationDrawer = this.#navigationDrawer as HTMLElement;

    if (!isLogin) {
      navigationDrawer.innerHTML = generateNavigationUnauthenticated();
      return;
    }

    navigationDrawer.innerHTML = generateNavigationAuthenticated();

    const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;

    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (confirm('Apakah Anda yakin ingin keluar?')) {
        getLogout();

        location.hash = '/login';
      }
    });
  }

  async renderPage() {
    const url = getActiveRoute() || '/';
    const route = routes[url as keyof typeof routes];

    const page = route();

    const transition = transitionHelper({
      updateDOM: async () => {
        if (this.#content) {
          this.#content.innerHTML = await page.render();
          page.afterRender();
        }
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this.#setupNavigationList();
    });

    // if (this.#content) {
    //   this.#content.innerHTML = await page.render();
    //   await page.afterRender();
    // }
  }
}

export default App;
