import HomePresenter from './presenter';
import * as STORY_API from '../../data/api';
import { IStory } from '../../types/api';
import { generateCardStory } from '../../components/templates';

export default class HomePage {
  #presenter = null as HomePresenter | null;

  async render() {
    return `
    <section id="home-container" class="page-wrapper">
        <div>
        </div>
        <div class="flex flex-col gap-5" >
            <div class="flex flex-col gap-1 items-center justify-center">
                <h1 class="text-4xl font-bold text-center">Ceritain</h1>
                <p class="text-2xl font-medium text-center">Ceritakan semua yang pengen kamu ceritakan!</p>
            </div>
            <div id="list-story" class="story-container">
            </div>
            <div id="loading-container" class="hidden">
            </div>
        </div>
    </section>
        `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: STORY_API,
    });

    await this.#presenter?.initialStories();
  }

  populateStoriesList(message: string, listStory: IStory[]) {
    if (listStory.length === 0) {
      this.populateStoriesListError(message);
      return;
    }

    try {
      const container = document.getElementById('list-story');
      if (container) {
        const html = listStory.reduce((acc, story) => {
          return acc + generateCardStory(story);
        }, '');
        container.innerHTML = html;
        console.log('Story HTML inserted successfully');
      } else {
        console.error('list-story element not found');
      }
    } catch (error) {
      console.error('Error generating story cards:', error);
      this.populateStoriesListError('Error displaying stories');
    }
  }

  showLoading() {
    const container = document.getElementById('loading-container') as HTMLDivElement;
    container.classList.remove('hidden');
    container.classList.add('story-container');
    Array.from({ length: 3 }).forEach(() => {
      const loadingCard = document.createElement('div');
      loadingCard.classList.add('story-card-skeleton');
      container.appendChild(loadingCard);
    });
  }

  hideLoading() {
    const container = document.getElementById('loading-container') as HTMLDivElement;
    container.classList.add('hidden');
    container.classList.remove('story-container');
    container.innerHTML = '';
  }

  populateStoriesListError(message: string) {
    const container = document.getElementById('home-container') as HTMLDivElement;
    container.classList.remove('page-wrapper');
    container.classList.add('page-error-wrapper');

    container.innerHTML = `
        <div class="flex items-center gap-2 text-center justify-center flex-col h-full">
            <h2 class="text-6xl md:text-8xl font-black">Oops!</h2>
            <p class="text-base md:text-2xl">Terjadi kesalahan pengambilan daftar laporan</p>
            <p class="text-sm md:text-base font-bold text-red-500">${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
        </div>
    `;
  }
}
