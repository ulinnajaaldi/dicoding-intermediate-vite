import Map from '../../utils/maps';
import DetailPresenter from './presenter';
import * as STORY_API from '../../data/api';
import { parseActivePathname } from '../../utils/url-parser';
import { StoryMapper } from '../../data/api-mapper';

export default class Detail {
  #presenter = null as DetailPresenter | null;
  #map = null as Map | null;

  async render() {
    return `
        <section id="detail-container" class="container mt-24 md:mt-28 lg:mt-32 2xl:mt-40">
            <div id="detail-story" class=""></div>
            <div id="detail-story-loading-container" class="hidden"></div>
        </section>`;
  }

  async afterRender() {
    this.#presenter = new DetailPresenter(parseActivePathname().id as string, {
      view: this,
      model: STORY_API,
    });

    await this.#presenter?.initialStory();
  }

  populateStory(message: string, story: StoryMapper) {
    if (!story) {
      this.populateStoryError(message);
      return;
    }

    const container = document.getElementById('detail-story') as HTMLDivElement;

    const html = `
        <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1 items-center justify-center mb-5">
               <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">Detail Cerita</h1>
                <p class="text-sm sm:text-xl lg:text-2xl font-medium text-center">Ceritakan semua yang pengen kamu ceritakan!</p>
            </div>

            <div class="relative w-full h-64 overflow-hidden rounded-lg">
                <img src="${story.photoUrl}" alt="${story.name}-${story.description}" class="h-64 w-full object-cover rounded-t-lg"/>
            </div>
            
            <div id="map" class="h-[300px]"></div>
            <div id="map-loading-container" class="hidden"></div>
        </div>
    `;
    container.innerHTML = html;
  }

  populateStoryError(message: string) {
    const container = document.getElementById('detail-story') as HTMLDivElement;
    const html = `
        <div class="flex items-center gap-2 text-center justify-center flex-col h-full">
            <h2 class="text-6xl md:text-8xl font-black">Oops!</h2>
            <p class="text-base md:text-2xl">Terjadi kesalahan pengambilan daftar laporan</p>
            <p class="text-sm md:text-base font-bold text-red-500">${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
        </div>
        `;
    container.innerHTML = html;
  }

  showLoading() {
    console.log('showLoading');
  }

  hideLoading() {
    console.log('hideLoading');
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });
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
}
