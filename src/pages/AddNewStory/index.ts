import Toastify from 'toastify-js';
import { LeafletEvent, LeafletMouseEvent } from 'leaflet';

import * as STORY_API from '../../data/api';
import AddNewStoryPresenter from './presenter';
import { convertBase64ToBlob } from '../../utils';
import Camera from '../../utils/camera';
import Map from '../../utils/maps';

export default class AddNewStory {
  #presenter = null as AddNewStoryPresenter | null;
  #form = null as HTMLFormElement | null;
  #camera = null as Camera | null;
  #isCameraOpen = false;
  #takenPicture = null as { blob: Blob } | null;
  #map = null as Map | null;

  async render() {
    return `
        <section class="page-wrapper">
            <div class="flex flex-col gap-1 items-center justify-center mb-5">
                <h1 class="text-2xl font-bold">Cerita apa hari ini?</h1>
                <p>Lengkapi form dibawah untuk membagikan cerita</p>
            </div>
            <div class="card flex items-center justify-center">
                <form id="add-new-story-form" class="flex flex-col gap-5 w-full max-w-lg">
                    <div class="flex flex-col gap-2">
                        <label for="description" class="text-sm font-medium">Deskripsi</label>
                        <textarea id="description" name="description" placeholder="Ceritakan kisahmu disini..." required class="textarea-custom"></textarea>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="input-picture" class="text-sm font-medium">Foto</label>
                        <div class="flex items-center gap-2">
                            <button id="action-input-picture" type="button" class="button-custom-neutral">Ambil Gambar</button>
                            <input
                                id="input-picture"
                                name="documentations"
                                type="file"
                                accept="image/*"
                                hidden="hidden"
                                aria-multiline="true"
                                aria-describedby="picture-preview"
                            >
                            <button id="action-open-camera" type="button" class="button-custom-neutral">Buka Kamera</button>
                        </div>
                        <div id="camera-container" class="card !hidden">
                            <video id="camera-video" class="rounded-base w-full block">
                                Video stream not available.
                            </video>
                            <canvas id="camera-canvas" class="hidden"></canvas>
            
                            <div class="flex flex-col gap-2 ">
                                <select id="camera-select" class="select-custom !w-full">
                                </select>
                                <div class="new-form__camera__tools_buttons">
                                <button id="camera-take-button" class="button-custom-neutral" type="button">
                                    Ambil Gambar
                                </button>
                                </div>
                            </div>
                        </div>
                        <div id="documentations-taken-list" class="flex items-center justify-center mt-2">
                        </div>
                    </div>
                    <div class="flex flex-col gap-2"> 
                        <div id="map" class=""></div>
                        <div id="map-loading-container" class="hidden"></div>
                        <div class="grid grid-cols-2 gap-3">
                            <input type="number" name="latitude" value="-6.175389" class="input-custom" disabled>
                            <input type="number" name="longitude" value="106.827139" class="input-custom" disabled>
                        </div>
                    </div>
                    <div id="submit-button-container" >
                        <button type="submit" id="submit-button" class="button-custom">Kirim Cerita</button>
                    </div>
                </form>
            </div>
        </section>
        `;
  }

  async afterRender() {
    // Add your logic after rendering the page here
    this.#presenter = new AddNewStoryPresenter({
      view: this,
      model: STORY_API,
    });

    this.#takenPicture = null;

    this.#presenter.showNewFormMap();

    this.#setupForm();
  }

  #setupForm() {
    this.#form = document.getElementById('add-new-story-form') as HTMLFormElement;
    this.#form.addEventListener('submit', async (event: Event) => {
      event.preventDefault();

      if (!this.#takenPicture) {
        Toastify({
          text: 'Silahkan ambil gambar atau pilih gambar terlebih dahulu',
          duration: 3000,
        }).showToast();
        return;
      }

      const data = {
        description: this.#form?.description.value,
        photo: this.#takenPicture?.blob,
        lat: this.#form?.latitude.value,
        lon: this.#form?.longitude.value,
      };

      await this.#presenter?.postNewStory(data);
    });

    // Connect button to file input
    const actionInputPicture = document.getElementById('action-input-picture');
    const inputPicture = document.getElementById('input-picture') as HTMLInputElement;
    const cameraContainer = document.getElementById('camera-container') as HTMLDivElement;
    const actionOpenCamera = document.getElementById('action-open-camera') as HTMLButtonElement;

    actionInputPicture?.addEventListener('click', () => {
      inputPicture.click();
    });

    // Handle file selection
    inputPicture?.addEventListener('change', async (event: Event) => {
      const insertingPicture = (event.target as HTMLInputElement).files?.[0];
      if (insertingPicture) {
        this.#takenPicture = {
          blob: insertingPicture,
        };
        await this.#populateTakenPicture();
      }
    });

    actionOpenCamera?.addEventListener('click', async (event: Event) => {
      cameraContainer.classList.toggle('!hidden');
      this.#isCameraOpen = !this.#isCameraOpen;
      if (this.#isCameraOpen) {
        (event.currentTarget as HTMLButtonElement).textContent = 'Tutup Kamera';
        this.#setupCamera();
        await this.#camera?.launch();

        return;
      }
      (event.currentTarget as HTMLButtonElement).textContent = 'Buka Kamera';
      this.#camera?.stop();
    });
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });

    const centeredCoordinate = this.#map.getCenter();

    this.#updateLatLngInput(centeredCoordinate.latitude, centeredCoordinate.longitude);

    const draggableMarker = this.#map.addMarker(
      [centeredCoordinate.latitude, centeredCoordinate.longitude],
      { draggable: true },
    );

    draggableMarker.addEventListener('move', (event: LeafletEvent) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    this.#map.addMapEventListener('click', (event: LeafletEvent) => {
      const mouseEvent = event as LeafletMouseEvent;
      draggableMarker.setLatLng(mouseEvent.latlng);
    });
  }

  #updateLatLngInput(latitude: number, longitude: number) {
    if (!this.#form) return;

    const longitudeInput = this.#form.elements.namedItem('longitude') as HTMLInputElement | null;
    const latitudeInput = this.#form.elements.namedItem('latitude') as HTMLInputElement | null;

    if (longitudeInput) longitudeInput.value = String(longitude);
    if (latitudeInput) latitudeInput.value = String(latitude);
  }

  async #addTakenPicture(image: string | Blob) {
    let blob = image;

    if (typeof image === 'string') {
      blob = await convertBase64ToBlob(image, 'image/png');
    }

    if (blob) {
      this.#takenPicture = {
        blob: blob as Blob,
      };
    }
  }

  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById('camera-video') as HTMLVideoElement,
        canvas: document.getElementById('camera-canvas') as HTMLCanvasElement,
        cameraSelect: document.getElementById('camera-select') as HTMLSelectElement,
      });

      this.#camera.addCheeseButtonListener(
        document.getElementById('camera-take-button') as HTMLButtonElement,
        async () => {
          const image = await this.#camera?.takePicture();
          if (image) {
            await this.#addTakenPicture(image);
            await this.#populateTakenPicture();
          }
        },
      );
    }
  }

  async #populateTakenPicture() {
    if (!this.#takenPicture) return;

    const imageUrl = URL.createObjectURL(this.#takenPicture.blob);
    const html = `
            <div class="relative w-lg h-[400px] card !p-0">
                <img 
                    id="picture-preview"
                    src="${imageUrl}"
                    alt="Preview Gambar"
                    class="object-contain rounded-2xl w-full h-full"
                />
                <button id="action-delete-picture" type="button" class="absolute top-2 right-2 button-custom-destructive">
                    X
                </button>
            </div>
    `;
    const container = document.getElementById('documentations-taken-list') as HTMLDivElement;
    container.innerHTML = html;

    const deleteButton = document.getElementById('action-delete-picture') as HTMLButtonElement;
    deleteButton.addEventListener('click', () => {
      this.#takenPicture = null;
      container.innerHTML = '';
    });
  }

  storeSuccessfully(message: string) {
    Toastify({
      text: message,
      duration: 3000,
    }).showToast();
    this.clearForm();

    location.hash = '/';
  }

  storeFailed(message: string) {
    Toastify({
      text: message,
      duration: 3000,
    }).showToast();
  }

  clearForm() {
    this.#form?.reset();
  }

  showSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById('submit-button-container');
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
            <button class="button-custom w-full" type="submit" disabled>
                <i class="fas fa-spinner animate-spin"></i> Kirim Cerita
            </button>
        `;
    }
  }

  hideSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById('submit-button-container');
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
            <button class="button-custom w-full" type="submit">Kirim Cerita</button>
        `;
    }
  }

  showMapLoading() {
    const container = document.getElementById('map-loading-container') as HTMLDivElement;
    container.classList.remove('hidden');
    container.classList.add('maps-loading-container', '!h-[300px]');
  }

  hideMapLoading() {
    const mapContainer = document.getElementById('map') as HTMLDivElement;
    const container = document.getElementById('map-loading-container') as HTMLDivElement;
    container.classList.add('hidden');
    container.classList.remove('maps-loading-container', '!h-[300px]');
    mapContainer.classList.add('maps-container', '!h-[300px]');
    container.innerHTML = '';
  }
}
