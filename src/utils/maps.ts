import {
  Map as LeafletMap,
  Icon,
  Marker,
  LeafletEvent,
  MarkerOptions,
  PopupOptions,
  LatLngExpression,
  control,
} from 'leaflet';
import { map, tileLayer, icon, marker, popup, latLng } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MAP_SERVICE_API_KEY } from '../constants/config';

interface MapOptions {
  center?: LatLngExpression;
  locate?: boolean;
  zoom?: number;
  [key: string]: any;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  features: {
    place_name: string;
    [key: string]: any;
  }[];
  [key: string]: any;
}

export default class Map {
  #zoom = 5;
  #map: LeafletMap | null = null;

  static isGeolocationAvailable(): boolean {
    return 'geolocation' in navigator;
  }

  static getCurrentPosition(options: PositionOptions = {}): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!Map.isGeolocationAvailable()) {
        reject('Geolocation API unsupported');
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  static async getPlaceNameByCoordinate(latitude: number, longitude: number): Promise<string> {
    try {
      if (
        latitude === null ||
        longitude === null ||
        latitude === undefined ||
        longitude === undefined
      ) {
        return 'Unknown location';
      }

      const url = new URL(`https://api.maptiler.com/geocoding/${longitude},${latitude}.json`);
      url.searchParams.set('key', MAP_SERVICE_API_KEY);
      url.searchParams.set('language', 'id');
      url.searchParams.set('limit', '1');

      const response = await fetch(url);
      const json: GeocodingResponse = await response.json();

      // Check if features array exists and has at least one item
      if (!json.features || json.features.length === 0) {
        return `${latitude}, ${longitude}`;
      }

      const place = json.features[0].place_name.split(', ');
      return [place.at(-2), place.at(-1)].filter((name) => name).join(', ');
    } catch (error) {
      console.error('getPlaceNameByCoordinate: error:', error);
      return `${latitude}, ${longitude}`;
    }
  }

  /**
   * Reference of using this static method:
   * https://stackoverflow.com/questions/43431550/how-can-i-invoke-asynchronous-code-within-a-constructor
   * */
  static async build(selector: string, options: MapOptions = {}): Promise<Map> {
    if ('center' in options && options.center) {
      return new Map(selector, options);
    }

    const jakartaCoordinate: [number, number] = [-6.2, 106.816666];

    // Using Geolocation API
    if ('locate' in options && options.locate) {
      try {
        const position = await Map.getCurrentPosition();
        const coordinate: [number, number] = [position.coords.latitude, position.coords.longitude];

        return new Map(selector, {
          ...options,
          center: coordinate,
        });
      } catch (error) {
        console.error('build: error:', error);

        return new Map(selector, {
          ...options,
          center: jakartaCoordinate,
        });
      }
    }

    return new Map(selector, {
      ...options,
      center: jakartaCoordinate,
    });
  }

  constructor(selector: string, options: MapOptions = {}) {
    this.#zoom = options.zoom ?? this.#zoom;

    const tileOsm = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    });

    const tileCarto = tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    });

    const baseMaps = {
      OpenStreetMap: tileOsm,
      Carto: tileCarto,
    };

    this.#map = map(document.querySelector(selector) as HTMLElement, {
      zoom: this.#zoom,
      scrollWheelZoom: true,
      layers: [tileOsm, tileCarto],
      ...options,
    });

    control.layers(baseMaps).addTo(this.#map!);
  }

  addMapEventListener(eventName: string, callback: (event: LeafletEvent) => void): void {
    this.#map?.addEventListener(eventName, callback);
  }

  getCenter(): Coordinates {
    const center = this.#map?.getCenter();
    return {
      latitude: center?.lat || 0,
      longitude: center?.lng || 0,
    };
  }

  changeCamera(coordinate: LatLngExpression, zoomLevel: number | null = null): void {
    if (!zoomLevel) {
      this.#map?.setView(latLng(coordinate), this.#zoom);
      return;
    }
    this.#map?.setView(latLng(coordinate), zoomLevel);
  }

  createIcon(options: Partial<Icon> = {}): Icon {
    return icon({
      ...Icon.Default.prototype.options,
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      ...options,
    });
  }

  addMarker(
    coordinates: LatLngExpression,
    markerOptions: MarkerOptions = {},
    popupOptions: (PopupOptions & { content: string }) | null = null,
  ): Marker {
    if (typeof markerOptions !== 'object') {
      throw new Error('markerOptions must be an object');
    }

    const newMarker = marker(coordinates, {
      icon: this.createIcon(),
      ...markerOptions,
    });

    if (popupOptions) {
      if (typeof popupOptions !== 'object') {
        throw new Error('popupOptions must be an object');
      }
      if (!('content' in popupOptions)) {
        throw new Error('popupOptions must include `content` property.');
      }

      const newPopup = popup({
        ...popupOptions,
      }).setContent(popupOptions.content);

      newMarker.bindPopup(newPopup);
    }

    newMarker.addTo(this.#map!);
    return newMarker;
  }
}
