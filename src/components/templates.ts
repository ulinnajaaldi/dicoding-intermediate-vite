import { StoryMapper } from '../data/api-mapper';

export const generateNavigationUnauthenticated = () => {
  return `
        <li class="absolute top-0 right-0 m-3 lg:hidden px-2">
            <button id="close-button" class="button-custom"
            tabindex="0" aria-label="Tutup Menu"
            >X</button>
        </li>
        <li><a class="block px-3 py-2 text-gray-800 hover:underline" href="#/login">Masuk</a></li>
        <li><a class="block px-3 py-2 text-gray-800 hover:underline" href="#/register">Daftar</a></li>
    `;
};

export const generateNavigationAuthenticated = () => {
  return `
        <li class="absolute top-0 right-0 m-3 lg:hidden px-2">
            <button id="close-button" class="button-custom"
            tabindex="0" aria-label="Tutup Menu"
            >X</button>
        </li>
        <li><a class="block px-3 py-2 text-gray-800 hover:underline button-custom-neutral" href="#/stories">Tambah Ceritamu</a></li>
        <li><a id="logout-button" class="block px-3 py-2 text-gray-800 hover:underline w-fit" href="#/logout">Keluar</a></li>
    `;
};

export const generateCardStory = ({
  id,
  name,
  createdAt,
  description,
  location,
  photoUrl,
}: StoryMapper) => {
  return `
                <div tabindex="0" data-storyid="${id}" class="card">
                    <div class="flex flex-col gap-2">
                        <div class="relative w-full h-64 overflow-hidden rounded-lg">
                            <img src="${photoUrl}" alt="${name}-${description}" class="h-64 w-full object-cover rounded-t-lg"/>
                        </div>
                        <div class="card-header">
                            <h2 class="text-lg font-semibold">${name}</h2>
                            <div class="flex items-center flex-wrap justify-between w-full">
                                ${location ? `<p class="text-base">${location.placeName}</p>` : ``}
                                <p class="text-sm">${new Date(createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <p class="text-base line-clamp-3">${description}</p>
                        <div class="flex items-center justify-end"> 
                            <button class="button-custom w-fit">
                                Lihat Detail
                            </button>
                        </div>
                    </div>
                </div>
    `;
};
