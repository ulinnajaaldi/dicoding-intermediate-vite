import HomePresenter from './presenter';
import * as STORY_API from '../../data/api';
import { generateCardStory } from '../../components/templates';
import Map from '../../utils/maps';
import { StoryMapper } from '../../data/api-mapper';

export default class HomePage {
  #presenter = null as HomePresenter | null;
  #map = null as Map | null;

  async render() {
    return `
    <section id="map-container" class="container mt-24 md:mt-28 lg:mt-32 2xl:mt-40;">
        <div class="flex flex-col gap-1 items-center justify-center mb-5">
                <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">Ceritain</h1>
                <p class="text-sm sm:text-xl lg:text-2xl font-medium text-center">Ceritakan semua yang pengen kamu ceritakan!</p>
        </div>
        <div id="map" class=""></div>
        <div id="map-loading-container" class="hidden"></div>
    </section>
    <section id="stories-container" class="container min-h-[70svh] my-10">
        <div class="flex flex-col gap-5" >
            <div id="list-story" class="story-container"> </div>
            <div id="loading-container" class="hidden"> </div>
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

  populateStoriesList(message: string, listStory: StoryMapper[]) {
    if (listStory.length === 0) {
      this.populateStoriesListError(message);
      return;
    }

    const container = document.getElementById('list-story');

    if (container) {
      const html = listStory.reduce((acc, story) => {
        if (this.#map && story?.location?.latitude != null && story?.location?.longitude != null) {
          const coordinate = [story.location.latitude, story.location.longitude] as [
            number,
            number,
          ];
          const markerOptions = { alt: `${story.name}-${story.description}` };
          const popupOptions = {
            content: `
            <div class="flex flex-col">
                <p class="font-bold">${story.name}</p>
                <div class="relative w-32 h-32 sm:w-60 sm:h-60 overflow-hidden rounded-lg">
                    <img src="${story.photoUrl}" alt="${story.name}-${story.description}" class="object-cover rounded-lg w-full h-full "/>
                </div>
                <p class="text-sm">${story.description}</p>
            </div>`,
          };
          this.#map.addMarker(coordinate, markerOptions, popupOptions);
        }
        return acc.concat(generateCardStory(story));
      }, '');
      container.innerHTML = html;
      console.log('Story HTML inserted successfully');
    } else {
      console.error('list-story element not found');
    }
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });
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
    container?.classList.add('hidden');
    container?.classList.remove('story-container');
    container.innerHTML = '';
  }

  showMapLoading() {
    const container = document.getElementById('map-loading-container') as HTMLDivElement;
    container.classList.remove('hidden');
    container.classList.add('maps-loading-container');
  }

  hideMapLoading() {
    const mapContainer = document.getElementById('map') as HTMLDivElement;
    const container = document.getElementById('map-loading-container') as HTMLDivElement;
    container.classList.add('hidden');
    container.classList.remove('maps-loading-container');
    mapContainer.classList.add('maps-container');
    container.innerHTML = '';
  }

  populateStoriesListError(message: string) {
    const container = document.getElementById('stories-container') as HTMLDivElement;
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
